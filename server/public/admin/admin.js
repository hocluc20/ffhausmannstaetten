/**
 * Redaktionsoberflaeche der FF Hausmannstaetten.
 *
 * Bewusst ohne Framework und ohne Buildschritt: das Backend liefert die drei
 * Dateien direkt aus, ein "npm run build" fuer die Redaktion gibt es nicht.
 *
 * Die Oberflaeche kennt die Bedeutung der Kategoriestruktur (siehe
 * src/common/bl/FilterFunctions.ts im Frontend): Unterkategorien von
 * "einsatze" sind Einsatzarten, die von "fahrzeuge" Fahrzeuge, die von
 * "einsatzmittel" weitere Organisationen. Deshalb gibt es hier je ein eigenes
 * Bedienelement dafuer statt einer nackten Kategorieliste.
 */

const API = "/api/v1";
const STORAGE_KEY = "ff-admin-key";
const PARENTS = { types: "einsatze", vehicles: "fahrzeuge", organisations: "einsatzmittel" };

const state = {
  key: null,
  categories: [],
  media: [],
  posts: [],
  settings: {},
  members: [],
  fleet: [],
  folders: [],
  /** null = alle Ordner anzeigen. */
  folder: null,
  /** Der gerade offene Beitrag; null = neuer Beitrag, undefined = keiner. */
  current: undefined,
  /** Beitragstext wird als HTML statt als Absaetze bearbeitet. */
  htmlMode: false,
  /** Bilder im Text, die zu keinem Mediendatensatz gehoeren (z. B. aus WordPress). */
  foreignPhotos: [],
  /** Kategorien des Beitrags ausserhalb der drei bekannten Gruppen. */
  otherCategories: [],
  selectedPhotos: [],
  featured: 0,
};

const $ = (id) => document.getElementById(id);
const el = (tag, props = {}, children = []) => {
  const node = Object.assign(document.createElement(tag), props);
  for (const child of [].concat(children)) {
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
};

/* ------------------------------------------------------------------ Server */

const request = async (path, { method = "GET", json, body, headers = {} } = {}) => {
  const response = await fetch(API + path, {
    method,
    headers: {
      ...(state.key ? { "X-API-Key": state.key } : {}),
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json ? JSON.stringify(json) : body,
  });

  if (response.status === 401) {
    logout();
    throw new Error("Der Zugangsschlüssel wurde abgelehnt. Bitte neu anmelden.");
  }
  if (!response.ok) {
    // Das Backend liefert Fehler im WordPress-Format mit lesbarer Meldung.
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.message || `Anfrage fehlgeschlagen (HTTP ${response.status}).`);
  }
  return response.status === 204 ? null : response.json();
};

const toast = (message, kind = "ok") => {
  const node = el("div", { className: `toast ${kind}`, textContent: message });
  $("toasts").append(node);
  setTimeout(() => node.remove(), kind === "err" ? 6000 : 3000);
};

const failed = (error) => toast(error.message, "err");

/* -------------------------------------------------------------- Kategorien */

const childrenOf = (slug) => {
  const parent = state.categories.find((c) => c.slug === slug);
  return parent ? state.categories.filter((c) => c.parent === parent.id) : [];
};

const parentId = (slug) => state.categories.find((c) => c.slug === slug)?.id ?? 0;

/** Alle IDs, die von den drei Gruppen (inkl. Elternkategorien) belegt sind. */
const managedIds = () => {
  const ids = new Set();
  for (const slug of Object.values(PARENTS)) {
    const parent = state.categories.find((c) => c.slug === slug);
    if (!parent) continue;
    ids.add(parent.id);
    for (const child of childrenOf(slug)) ids.add(child.id);
  }
  return ids;
};

/* ------------------------------------------------------- Text <-> HTML ---- */

// Aus content.js - dort getestet, weil hier Inhalte verloren gehen koennten.
const { escapeHtml, decodeEntities, toRelative, parseContent, buildContent } = window.FFContent;

/* -------------------------------------------------------------- Anmeldung */

const showApp = () => {
  $("login").hidden = true;
  $("app").hidden = false;
};

const logout = () => {
  state.key = null;
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  $("app").hidden = true;
  $("login").hidden = false;
  $("login-key").value = "";
};

const signIn = async (key, remember) => {
  state.key = key;
  await request("/session");
  (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, key);
  showApp();
  await loadEverything();
};

/* ------------------------------------------------------------------ Laden */

const loadEverything = async () => {
  const [categories, media, posts, settings, members, fleet, folders] = await Promise.all([
    request("/categories?per_page=100"),
    request("/media?per_page=100"),
    request("/posts?per_page=100&status=any&_embed=1"),
    request("/settings"),
    request("/members?include_inactive=1"),
    request("/vehicles?include_inactive=1"),
    request("/media-folders"),
  ]);
  state.categories = categories;
  state.media = media;
  state.posts = posts;
  state.settings = settings;
  state.members = members;
  state.fleet = fleet;
  state.folders = folders;

  renderPostList();
  renderCategories();
  renderMedia();
  renderSettings();
  renderMembers();
  renderFleet();
};

const reloadMembers = async () => {
  state.members = await request("/members?include_inactive=1");
  renderMembers();
};

const reloadFleet = async () => {
  state.fleet = await request("/vehicles?include_inactive=1");
  renderFleet();
};

const reloadPosts = async () => {
  state.posts = await request("/posts?per_page=100&status=any&_embed=1");
  renderPostList();
  // Die Einsatzzahl des Jahres wird berechnet und aendert sich hierdurch mit.
  state.settings = await request("/settings");
  renderSettings();
};

const reloadMedia = async () => {
  const [media, folders] = await Promise.all([
    request("/media?per_page=100"),
    request("/media-folders"),
  ]);
  state.media = media;
  state.folders = folders;
  renderMedia();
  // Die Auswahlfelder in den Editoren zeigen dieselben Bilder.
  if (state.current !== undefined) renderPickers();
  if (state.current !== undefined) renderPickers();
};

/* ------------------------------------------------------------ Einsatzliste */

const typeOf = (post) => {
  const types = childrenOf(PARENTS.types);
  return types.find((type) => post.categories.includes(type.id));
};

const renderPostList = () => {
  const query = $("post-search").value.trim().toLowerCase();
  const status = $("post-status-filter").value;

  const visible = state.posts.filter((post) => {
    if (status !== "any" && post.status !== status) return false;
    if (!query) return true;
    return `${post.title.rendered} ${post.excerpt.rendered}`.toLowerCase().includes(query);
  });

  const list = $("post-list");
  list.textContent = "";
  $("post-list-empty").hidden = visible.length > 0;

  for (const post of visible) {
    const type = typeOf(post);
    const meta = el("div", { className: "row-meta" }, [
      new Date(post.date).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric" }),
    ]);
    if (type) meta.append(el("span", { className: "badge type", textContent: type.name }));
    if (post.status !== "publish") meta.append(el("span", { className: "badge draft", textContent: "Entwurf" }));

    const item = el("li", { className: state.current?.id === post.id ? "is-active" : "" }, [
      el("div", { className: "row-title", textContent: post.title.rendered || "(ohne Titel)" }),
      meta,
    ]);
    item.addEventListener("click", () => openPost(post));
    list.append(item);
  }
};

/* ----------------------------------------------------------------- Editor */

const renderChips = (container, categories, selected) => {
  container.textContent = "";
  if (categories.length === 0) {
    container.append(el("p", { className: "muted", textContent: "Noch keine angelegt – siehe Reiter „Kategorien“." }));
    return;
  }
  for (const category of categories) {
    const box = el("input", { type: "checkbox", checked: selected.includes(category.id) });
    const label = el("label", { className: `chip${box.checked ? " is-on" : ""}` }, [
      box,
      category.name,
    ]);
    box.addEventListener("change", () => label.classList.toggle("is-on", box.checked));
    label.dataset.id = String(category.id);
    container.append(label);
  }
};

const chosenIds = (container) =>
  [...container.querySelectorAll(".chip")]
    .filter((label) => label.querySelector("input").checked)
    .map((label) => Number(label.dataset.id));

const renderPickers = () => {
  // Titelbild: genau eines oder keines.
  const featured = $("f-featured");
  featured.textContent = "";

  // Hochladen direkt hier: das neue Bild wird sofort als Titelbild gesetzt,
  // ohne Umweg über den Reiter „Medien“.
  const featuredUpload = uploadButton("Bild hochladen", {
    folder: "Einsätze",
    onDone: async (created) => {
      state.featured = created[0].id;
      renderPickers();
    },
  });
  const featuredBar = $("f-featured-upload");
  if (featuredBar) {
    featuredBar.textContent = "";
    featuredBar.append(featuredUpload);
  }

  const none = el("button", {
    type: "button",
    className: `pick none${state.featured ? "" : " is-on"}`,
    textContent: "kein Bild",
  });
  none.addEventListener("click", () => { state.featured = 0; renderPickers(); });
  featured.append(none);

  for (const item of state.media) {
    const button = el("button", {
      type: "button",
      className: `pick${state.featured === item.id ? " is-on" : ""}`,
    }, [
      el("img", { src: item.source_url, alt: "", loading: "lazy" }),
      el("span", { className: "cap", textContent: item.title.rendered }),
    ]);
    button.addEventListener("click", () => { state.featured = item.id; renderPickers(); });
    featured.append(button);
  }

  // Fotos im Bericht: Mehrfachauswahl.
  const photosUpload = $("f-photos-upload");
  if (photosUpload) {
    photosUpload.textContent = "";
    if (!state.htmlMode) {
      photosUpload.append(uploadButton("Fotos hochladen", {
        folder: "Einsätze",
        multiple: true,
        onDone: async (created) => {
          // Frisch hochgeladene Fotos sind sofort ausgewählt.
          state.selectedPhotos = [
            ...state.selectedPhotos,
            ...created.map((item) => toRelative(item.source_url)),
          ];
          renderPickers();
        },
      }));
    }
  }

  const photos = $("f-photos");
  photos.textContent = "";
  if (state.htmlMode) {
    photos.append(el("p", { className: "muted", textContent: "Im HTML-Modus stehen die Bilder direkt im Text." }));
  } else if (state.media.length === 0) {
    photos.append(el("p", { className: "muted", textContent: "Noch kein Bild – oben hochladen." }));
  } else {
    for (const item of state.media) {
      const on = state.selectedPhotos.includes(item.source_url);
      const button = el("button", { type: "button", className: `pick${on ? " is-on" : ""}` }, [
        el("img", { src: item.source_url, alt: "", loading: "lazy" }),
        el("span", { className: "cap", textContent: item.title.rendered }),
      ]);
      button.addEventListener("click", () => {
        state.selectedPhotos = on
          ? state.selectedPhotos.filter((url) => url !== item.source_url)
          : [...state.selectedPhotos, item.source_url];
        renderPickers();
      });
      photos.append(button);
    }
  }
};

const setHtmlMode = (on, { forced = false } = {}) => {
  state.htmlMode = on;
  $("toggle-html").textContent = on ? "Als Text bearbeiten" : "HTML bearbeiten";
  $("toggle-html").hidden = forced;
  $("html-warning").hidden = !forced;
  renderPickers();
};

const openPost = (post) => {
  state.current = post;
  $("post-editor").hidden = false;
  $("post-placeholder").hidden = true;
  $("delete-post").hidden = !post;
  $("post-editor-title").textContent = post ? "Einsatz bearbeiten" : "Neuer Einsatz";

  const categories = post ? post.categories : [];
  const known = managedIds();
  state.otherCategories = categories.filter((id) => !known.has(id));

  $("f-title").value = post ? decodeEntities(post.title.rendered) : "";
  $("f-excerpt").value = post ? decodeEntities(post.excerpt.rendered) : "";
  $("f-date").value = post ? post.date.slice(0, 16) : new Date().toISOString().slice(0, 16);
  $("f-status").value = post ? post.status : "publish";
  state.featured = post ? post.featured_media : 0;

  // Einsatzart
  const typeSelect = $("f-type");
  typeSelect.textContent = "";
  typeSelect.append(el("option", { value: "0", textContent: "– keine –" }));
  for (const type of childrenOf(PARENTS.types)) {
    typeSelect.append(el("option", {
      value: String(type.id),
      textContent: type.description ? `${type.name} – ${type.description}` : type.name,
      selected: categories.includes(type.id),
    }));
  }

  renderChips($("f-vehicles"), childrenOf(PARENTS.vehicles), categories);
  renderChips($("f-organisations"), childrenOf(PARENTS.organisations), categories);

  const html = post ? post.content.rendered : "";
  const parsed = parseContent(html);
  const knownUrls = new Set(state.media.map((m) => m.source_url));
  state.selectedPhotos = parsed.photos.filter((url) => knownUrls.has(url));
  state.foreignPhotos = parsed.photos.filter((url) => !knownUrls.has(url));

  if (post && html && !parsed.simple) {
    $("f-content").value = html;
    setHtmlMode(true, { forced: true });
  } else {
    $("f-content").value = parsed.paragraphs.join("\n\n");
    setHtmlMode(false);
  }

  renderPostList();
  $("f-title").focus();
};

const closeEditor = () => {
  state.current = undefined;
  $("post-editor").hidden = true;
  $("post-placeholder").hidden = false;
  renderPostList();
};

const savePost = async () => {
  const title = $("f-title").value.trim();
  if (!title) {
    toast("Bitte einen Titel eingeben.", "err");
    $("f-title").focus();
    return;
  }
  const date = $("f-date").value;
  if (!date) {
    toast("Bitte Datum und Uhrzeit angeben.", "err");
    return;
  }

  const typeId = Number($("f-type").value);
  const categories = [
    parentId(PARENTS.types), // Ohne die Elternkategorie findet die Website den Einsatz nicht.
    ...(typeId ? [typeId] : []),
    ...chosenIds($("f-vehicles")),
    ...chosenIds($("f-organisations")),
    ...state.otherCategories,
  ].filter(Boolean);

  const content = state.htmlMode
    ? $("f-content").value
    : buildContent($("f-content").value, [...state.selectedPhotos, ...state.foreignPhotos]);

  const payload = {
    title,
    excerpt: $("f-excerpt").value.trim(),
    // Sekunden ergaenzen: datetime-local liefert nur bis zur Minute.
    date: date.length === 16 ? `${date}:00` : date,
    status: $("f-status").value,
    featured_media: state.featured,
    categories: [...new Set(categories)],
    content,
  };

  const button = $("save-post");
  button.disabled = true;
  try {
    const saved = state.current
      ? await request(`/posts/${state.current.id}`, { method: "PATCH", json: payload })
      : await request("/posts", { method: "POST", json: payload });
    await reloadPosts();
    openPost(state.posts.find((p) => p.id === saved.id) ?? saved);
    toast("Einsatz gespeichert.");
  } catch (error) {
    failed(error);
  } finally {
    button.disabled = false;
  }
};

const deletePost = async () => {
  if (!state.current) return;
  if (!confirm(`„${decodeEntities(state.current.title.rendered)}“ wirklich löschen?`)) return;
  try {
    await request(`/posts/${state.current.id}`, { method: "DELETE" });
    closeEditor();
    await reloadPosts();
    toast("Einsatz gelöscht.");
  } catch (error) {
    failed(error);
  }
};

/* ------------------------------------------------------ Kategorienverwaltung */

const GROUPS = [
  {
    slug: PARENTS.types,
    title: "Einsatz- und Tätigkeitsarten",
    hint: "Jeder Eintrag bekommt genau eine davon. Nur Arten vom Typ „Einsatz“ zählen in die Einsatzzahl des Jahres auf der Startseite.",
    nameLabel: "Kürzel / Name",
    descriptionLabel: "Beschreibung",
    hasKind: true,
  },
  {
    slug: PARENTS.vehicles,
    title: "Fahrzeuge",
    hint: "Kurzname erscheint als Abzeichen, Langname im Detail des Einsatzes.",
    nameLabel: "Kurzname",
    descriptionLabel: "Langname",
  },
  {
    slug: PARENTS.organisations,
    title: "Weitere Organisationen",
    hint: "Wer war noch im Einsatz? Rotes Kreuz, Polizei, Nachbarwehren …",
    nameLabel: "Name",
    descriptionLabel: "Beschreibung",
  },
];

const kindSelect = (value) => {
  const select = el("select", { className: "kind" });
  select.append(el("option", { value: "einsatz", textContent: "Einsatz", selected: value !== "taetigkeit" }));
  select.append(el("option", { value: "taetigkeit", textContent: "Tätigkeit", selected: value === "taetigkeit" }));
  return select;
};

const categoryRow = (category, group = {}) => {
  const name = el("input", { type: "text", value: category.name });
  const description = el("input", { type: "text", value: category.description });
  const kind = group.hasKind ? kindSelect(category.meta?.kind) : null;
  const save = el("button", { className: "btn tiny ghost", textContent: "Speichern", disabled: true });
  const remove = el("button", { className: "btn tiny ghost danger", textContent: "Löschen" });

  const markDirty = () => { save.disabled = false; };
  name.addEventListener("input", markDirty);
  description.addEventListener("input", markDirty);
  if (kind) kind.addEventListener("change", markDirty);

  save.addEventListener("click", async () => {
    save.disabled = true;
    try {
      await request(`/categories/${category.id}`, {
        method: "PATCH",
        json: {
          name: name.value.trim(),
          description: description.value.trim(),
          ...(kind ? { kind: kind.value } : {}),
        },
      });
      await refreshCategories();
      toast("Kategorie gespeichert.");
    } catch (error) {
      failed(error);
      save.disabled = false;
    }
  });

  remove.addEventListener("click", async () => {
    const used = state.posts.filter((post) => post.categories.includes(category.id)).length;
    const warning = used
      ? `„${category.name}“ ist noch bei ${used} Einsatz/Einsätzen zugeordnet. Trotzdem löschen?`
      : `„${category.name}“ löschen?`;
    if (!confirm(warning)) return;
    try {
      await request(`/categories/${category.id}`, { method: "DELETE" });
      await refreshCategories();
      await reloadPosts();
      toast("Kategorie gelöscht.");
    } catch (error) {
      failed(error);
    }
  });

  return el("div", { className: `cat-row${kind ? " with-kind" : ""}` }, [
    el("div", {}, [name, el("div", { className: "slug", textContent: category.slug })]),
    description,
    ...(kind ? [kind] : []),
    el("div", {}, [save, " ", remove]),
  ]);
};

const newCategoryRow = (parent, group) => {
  const name = el("input", { type: "text", placeholder: group.nameLabel });
  const description = el("input", { type: "text", placeholder: group.descriptionLabel });
  const kind = group.hasKind ? kindSelect("einsatz") : null;
  const add = el("button", { className: "btn tiny primary", textContent: "Hinzufügen" });

  const submit = async () => {
    if (!name.value.trim()) { name.focus(); return; }
    add.disabled = true;
    try {
      await request("/categories", {
        method: "POST",
        json: {
          name: name.value.trim(),
          description: description.value.trim(),
          parent: parent.id,
          ...(kind ? { kind: kind.value } : {}),
        },
      });
      await refreshCategories();
      toast(`„${name.value.trim()}“ angelegt.`);
    } catch (error) {
      failed(error);
    } finally {
      add.disabled = false;
    }
  };

  add.addEventListener("click", submit);
  for (const input of [name, description]) {
    input.addEventListener("keydown", (event) => { if (event.key === "Enter") submit(); });
  }

  return el("div", { className: `cat-row new${kind ? " with-kind" : ""}` }, [
    name, description, ...(kind ? [kind] : []), add,
  ]);
};

const renderCategories = () => {
  const container = $("category-groups");
  container.textContent = "";

  for (const group of GROUPS) {
    const parent = state.categories.find((c) => c.slug === group.slug);
    const box = el("div", { className: "group" });

    box.append(el("div", { className: "group-head" }, [
      el("h3", { textContent: group.title }),
      el("p", { textContent: parent ? group.hint : `Hauptkategorie „${group.slug}“ fehlt – bitte anlegen.` }),
    ]));

    if (!parent) { container.append(box); continue; }

    box.append(el("div", { className: `cat-row head${group.hasKind ? " with-kind" : ""}` },
      [group.nameLabel, group.descriptionLabel, ...(group.hasKind ? ["Art"] : []), ""]
        .map((label) => el("span", { textContent: label }))
    ));
    for (const child of childrenOf(group.slug)) box.append(categoryRow(child, group));
    box.append(newCategoryRow(parent, group));
    container.append(box);
  }

  // Alles, was nicht zu den drei Gruppen gehoert, trotzdem sichtbar machen.
  const known = managedIds();
  const rest = state.categories.filter((c) => !known.has(c.id));
  if (rest.length) {
    const box = el("div", { className: "group" }, [
      el("div", { className: "group-head" }, [
        el("h3", { textContent: "Weitere Kategorien" }),
        el("p", { textContent: "Gehören zu keiner der drei Gruppen und werden auf der Website nicht ausgewertet." }),
      ]),
    ]);
    for (const category of rest) box.append(categoryRow(category));
    container.append(box);
  }
};

const refreshCategories = async () => {
  state.categories = await request("/categories?per_page=100");
  renderCategories();
  if (state.current !== undefined) openPost(state.current);
};

/* --------------------------------------------------------- Kennzahlen ---- */

/**
 * Die Startseite zaehlt diese Werte hoch. `stats.operationsThisYear` steht
 * bewusst nur zum Ablesen da: die Zahl ergibt sich aus den erfassten
 * Einsaetzen, damit sie nicht von Hand nachgepflegt werden muss.
 */
const SETTING_FIELDS = [
  { key: "stats.members", label: "Mitglieder", hint: "Aktivstand der Wehr" },
  { key: "stats.vehicles", label: "Fahrzeuge", hint: "Anzahl im Fuhrpark" },
  { key: "stats.foundedYear", label: "Gegründet", hint: "Gründungsjahr" },
];

const renderSettings = () => {
  const form = $("settings-form");
  form.textContent = "";

  const inputs = new Map();
  for (const field of SETTING_FIELDS) {
    const input = el("input", { type: "number", value: state.settings[field.key] ?? "" });
    inputs.set(field.key, input);
    form.append(el("div", { className: "cat-row" }, [
      el("div", {}, [
        el("strong", { textContent: field.label }),
        el("div", { className: "slug", textContent: field.hint }),
      ]),
      input,
      el("div", {}, []),
    ]));
  }

  const year = state.settings["stats.year"] ?? new Date().getFullYear();
  form.append(el("div", { className: "cat-row" }, [
    el("div", {}, [
      el("strong", { textContent: `Einsätze ${year}` }),
      el("div", { className: "slug", textContent: "wird aus den erfassten Einsätzen berechnet" }),
    ]),
    el("div", { className: "computed", textContent: state.settings["stats.operationsThisYear"] ?? "0" }),
    el("div", {}, []),
  ]));

  const save = el("button", { className: "btn primary", textContent: "Kennzahlen speichern" });
  save.addEventListener("click", async () => {
    save.disabled = true;
    try {
      const patch = {};
      for (const [key, input] of inputs) patch[key] = input.value.trim();
      state.settings = await request("/settings", { method: "PATCH", json: patch });
      renderSettings();
      toast("Kennzahlen gespeichert.");
    } catch (error) {
      failed(error);
    } finally {
      save.disabled = false;
    }
  });
  form.append(el("div", { className: "cat-row" }, [el("div", {}, []), el("div", {}, [save]), el("div", {}, [])]));
};


/* --------------------------------------------------------------- Mannschaft */

/**
 * Ohne Portrait wird kein Bild geladen: das Platzhalterbild der Website
 * liegt auf einem anderen Host und waere hier ein toter Verweis.
 */
const portraitPreview = (url, name) =>
  url
    ? el("img", { className: "portrait", src: url, alt: name, loading: "lazy" })
    : el("div", { className: "portrait-empty", title: "Kein Foto hinterlegt" }, ["\u2014"]);

/**
 * Eine Zeile der Mannschaftsliste.
 *
 * Gespeichert wird erst auf Klick, damit ein Vertipper nicht sofort in der
 * Datenbank landet. "Reihung" bestimmt sowohl die Reihenfolge innerhalb des
 * Bereichs als auch die Reihenfolge der Bereiche selbst.
 */
/** Schalter im Stil der uebrigen Oberflaeche. */
const toggleSwitch = (checked, { label, onChange }) => {
  const input = el("input", { type: "checkbox", checked, role: "switch" });
  const wrapper = el("label", { className: `switch${checked ? " is-on" : ""}`, title: label }, [
    input,
    el("span", { className: "switch-text", textContent: checked ? "Sichtbar" : "Versteckt" }),
  ]);
  input.addEventListener("change", async () => {
    wrapper.classList.toggle("is-on", input.checked);
    wrapper.querySelector(".switch-text").textContent = input.checked ? "Sichtbar" : "Versteckt";
    input.disabled = true;
    try {
      await onChange(input.checked);
    } catch (error) {
      // Zurueckdrehen, wenn das Speichern nicht geklappt hat.
      input.checked = !input.checked;
      wrapper.classList.toggle("is-on", input.checked);
      wrapper.querySelector(".switch-text").textContent = input.checked ? "Sichtbar" : "Versteckt";
      failed(error);
    } finally {
      input.disabled = false;
    }
  });
  return wrapper;
};

const memberRow = (member) => {
  const name = el("input", { type: "text", value: member.name, placeholder: "Name" });
  const rank = el("input", { type: "text", value: member.rank, placeholder: "Dienstgrad" });
  const func = el("input", { type: "text", value: member.function, placeholder: "Funktion" });
  const team = el("input", { type: "text", value: member.team, placeholder: "Bereich" });
  const order = el("input", { type: "number", value: member.sort_order, title: "Reihung" });
  const save = el("button", { className: "btn tiny ghost", textContent: "Speichern", disabled: true });
  const remove = el("button", { className: "btn tiny ghost danger", textContent: "Löschen" });

  const fields = [name, rank, func, team, order];
  const markDirty = () => { save.disabled = false; };
  for (const field of fields) field.addEventListener("input", markDirty);

  // Portrait: Vorschau, Upload direkt hier, Entfernen.
  const thumb = portraitPreview(member.portrait_url, member.name);

  const setPortrait = async (mediaId) => {
    await request(`/members/${member.id}`, { method: "PATCH", json: { portrait_media: mediaId } });
    await reloadMembers();
  };

  const upload = uploadButton(member.portrait_url ? "Ersetzen" : "Foto", {
    // Portraits landen in einem eigenen Ordner der Mediathek.
    folder: "Mannschaft",
    onDone: async (created) => {
      await setPortrait(created[0].id);
      toast("Portrait gespeichert.");
    },
  });

  const clear = el("button", { className: "btn tiny ghost", type: "button", textContent: "Entfernen" });
  clear.hidden = !member.portrait_url;
  clear.addEventListener("click", async () => {
    try {
      await setPortrait(0);
      toast("Portrait entfernt.");
    } catch (error) {
      failed(error);
    }
  });

  const visible = toggleSwitch(member.active !== false, {
    label: "Auf der Website anzeigen",
    onChange: (on) => request(`/members/${member.id}`, { method: "PATCH", json: { active: on } })
      .then(() => reloadMembers()),
  });

  save.addEventListener("click", async () => {
    if (!name.value.trim()) { name.focus(); return; }
    save.disabled = true;
    try {
      await request(`/members/${member.id}`, {
        method: "PATCH",
        json: {
          name: name.value.trim(),
          rank: rank.value.trim(),
          function: func.value.trim(),
          team: team.value.trim() || "Mannschaft",
          sort_order: Number(order.value) || 0,
        },
      });
      await reloadMembers();
      toast("Mitglied gespeichert.");
    } catch (error) {
      failed(error);
      save.disabled = false;
    }
  });

  remove.addEventListener("click", async () => {
    if (!confirm(`„${member.name}“ endgültig aus der Mannschaft löschen? Zum bloßen Ausblenden genügt der Schalter.`)) return;
    try {
      await request(`/members/${member.id}`, { method: "DELETE" });
      await reloadMembers();
      toast("Mitglied entfernt.");
    } catch (error) {
      failed(error);
    }
  });

  return el("div", { className: `cat-row member${member.active === false ? " is-off" : ""}` }, [
    el("div", { className: "portrait-cell" }, [thumb, el("div", { className: "portrait-actions" }, [upload, clear])]),
    name, rank, func, team, order, visible,
    el("div", {}, [save, " ", remove]),
  ]);
};

const newMemberRow = () => {
  const name = el("input", { type: "text", placeholder: "Name" });
  const rank = el("input", { type: "text", placeholder: "Dienstgrad" });
  const func = el("input", { type: "text", placeholder: "Funktion" });
  const team = el("input", { type: "text", placeholder: "Bereich" });
  const order = el("input", { type: "number", value: state.members.length, title: "Reihung" });
  const add = el("button", { className: "btn tiny primary", textContent: "Hinzufügen" });

  const submit = async () => {
    if (!name.value.trim()) { name.focus(); return; }
    add.disabled = true;
    try {
      await request("/members", {
        method: "POST",
        json: {
          name: name.value.trim(),
          rank: rank.value.trim(),
          function: func.value.trim(),
          team: team.value.trim() || "Mannschaft",
          sort_order: Number(order.value) || 0,
        },
      });
      await reloadMembers();
      toast(`„${name.value.trim()}“ angelegt.`);
    } catch (error) {
      failed(error);
    } finally {
      add.disabled = false;
    }
  };

  add.addEventListener("click", submit);
  for (const field of [name, rank, func, team]) {
    field.addEventListener("keydown", (event) => { if (event.key === "Enter") submit(); });
  }

  return el("div", { className: "cat-row member new" }, [
    el("div", { className: "portrait-cell" }, [
      el("span", { className: "hint", textContent: "nach dem Anlegen" }),
    ]),
    name, rank, func, team, order, el("span", {}), add,
  ]);
};

const renderMembers = () => {
  // Schalter fuer die ganze Seite - unabhaengig von den einzelnen Personen.
  const pageBar = $("members-page-toggle");
  if (pageBar) {
    pageBar.textContent = "";
    const on = state.settings["pages.membersVisible"] !== "0";
    pageBar.append(
      el("div", {}, [
        el("strong", { textContent: "Seite „Mannschaft“ auf der Website" }),
        el("div", {
          className: "slug",
          textContent: on
            ? "Die Seite ist öffentlich erreichbar und im Menü verlinkt."
            : "Die Seite ist ausgeblendet; der Menüpunkt entfällt.",
        }),
      ]),
      toggleSwitch(on, {
        label: "Ganze Seite anzeigen",
        onChange: async (visible) => {
          state.settings = await request("/settings", {
            method: "PATCH",
            json: { "pages.membersVisible": visible ? "1" : "0" },
          });
          renderMembers();
        },
      })
    );
  }

  const form = $("members-form");
  form.textContent = "";
  // Jede Beschriftung braucht ein eigenes Element: aufeinanderfolgende
  // Textknoten bilden im Grid zusammen nur EINE Zelle.
  form.append(el("div", { className: "cat-row member head" },
    ["Foto", "Name", "Dienstgrad", "Funktion", "Bereich", "Reihung", "Website", ""]
      .map((label) => el("span", { textContent: label }))
  ));
  for (const member of state.members) form.append(memberRow(member));
  form.append(newMemberRow());
};

/* ----------------------------------------------------------------- Fuhrpark */

/** Zeilenweise Eingabe: "Löschwasser: 3.000 l" je Zeile. */
const specsToText = (specs) => specs.map((s) => `${s.label}: ${s.value}`).join("\n");
const textToSpecs = (text) =>
  text.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const at = line.indexOf(":");
    return at === -1
      ? { label: line, value: "" }
      : { label: line.slice(0, at).trim(), value: line.slice(at + 1).trim() };
  });

const linesToList = (text) => text.split("\n").map((l) => l.trim()).filter(Boolean);

/** Fotos: eine Zeile je Bild, "URL | Bildunterschrift". */
const photosToText = (photos) =>
  photos.map((p) => (p.caption ? `${p.url} | ${p.caption}` : p.url)).join("\n");
const textToPhotos = (text) =>
  linesToList(text).map((line) => {
    const at = line.indexOf("|");
    return at === -1
      ? { url: line.trim(), caption: "" }
      : { url: line.slice(0, at).trim(), caption: line.slice(at + 1).trim() };
  });

const vehicleCard = (vehicle) => {
  const field = (label, node, hint) =>
    el("label", { className: "field" }, [
      el("span", {}, [label]),
      node,
      ...(hint ? [el("small", { className: "hint", textContent: hint })] : []),
    ]);

  const short = el("input", { type: "text", value: vehicle.short });
  const name = el("input", { type: "text", value: vehicle.name });
  const callSign = el("input", { type: "text", value: vehicle.call_sign });
  const order = el("input", { type: "number", value: vehicle.sort_order });
  const description = el("textarea", { rows: 4, value: vehicle.description });
  const specs = el("textarea", { rows: 5, value: specsToText(vehicle.specs) });
  const tasks = el("textarea", { rows: 4, value: vehicle.tasks.join("\n") });
  const photos = el("textarea", { rows: 3, value: photosToText(vehicle.photos) });

  // Hochladen direkt am Fahrzeug: die URL wird unten angehaengt, niemand
  // muss sie aus der Mediathek kopieren.
  const photosField = el("div", { className: "field-stack" }, [
    photos,
    uploadButton("Fotos hochladen", {
      folder: "Fahrzeuge",
      multiple: true,
      onDone: async (created) => {
        const lines = created.map((item) => `${toRelative(item.source_url)} | `);
        photos.value = [photos.value.trim(), ...lines].filter(Boolean).join("\n");
        photos.focus();
      },
    }),
  ]);

  // Verknuepfung mit der Kategorie, ueber die Einsaetze das Fahrzeug nennen.
  const category = el("select", {});
  category.append(el("option", { value: "0", textContent: "– keine –", selected: !vehicle.category_id }));
  for (const child of childrenOf(PARENTS.vehicles)) {
    category.append(el("option", {
      value: String(child.id),
      textContent: child.name,
      selected: child.id === vehicle.category_id,
    }));
  }

  const save = el("button", { className: "btn primary", textContent: "Speichern" });
  const remove = el("button", { className: "btn ghost danger", textContent: "Löschen" });

  save.addEventListener("click", async () => {
    if (!short.value.trim()) { short.focus(); return; }
    save.disabled = true;
    try {
      await request(`/vehicles/${vehicle.id}`, {
        method: "PATCH",
        json: {
          short: short.value.trim(),
          name: name.value.trim(),
          call_sign: callSign.value.trim(),
          description: description.value.trim(),
          specs: textToSpecs(specs.value),
          tasks: linesToList(tasks.value),
          photos: textToPhotos(photos.value),
          category_id: Number(category.value) || 0,
          sort_order: Number(order.value) || 0,
        },
      });
      await reloadFleet();
      toast("Fahrzeug gespeichert.");
    } catch (error) {
      failed(error);
    } finally {
      save.disabled = false;
    }
  });

  remove.addEventListener("click", async () => {
    if (!confirm(`„${vehicle.short}“ aus dem Fuhrpark löschen?`)) return;
    try {
      await request(`/vehicles/${vehicle.id}`, { method: "DELETE" });
      await reloadFleet();
      toast("Fahrzeug gelöscht.");
    } catch (error) {
      failed(error);
    }
  });

  return el("details", { className: "vehicle", open: false }, [
    el("summary", {}, [
      el("strong", { textContent: vehicle.short || "(ohne Kurzname)" }),
      el("span", { className: "slug", textContent: ` ${vehicle.name}` }),
    ]),
    el("div", { className: "vehicle-body" }, [
      field("Kurzname", short, "Steht am Fahrzeug, z. B. TLFA"),
      field("Bezeichnung", name, "Ausgeschrieben"),
      field("Funkrufname", callSign),
      field("Reihung", order),
      field("Verknüpfte Kategorie", category, "Darüber nennen Einsätze dieses Fahrzeug"),
      field("Beschreibung", description),
      field("Technische Daten", specs, "Eine Zeile je Angabe: Bezeichnung: Wert"),
      field("Aufgaben", tasks, "Eine Zeile je Aufgabe"),
      field("Fotos", photosField, "Eine Zeile je Bild: URL | Bildunterschrift"),
      el("div", { className: "vehicle-actions" }, [save, " ", remove]),
    ]),
  ]);
};

const renderFleet = () => {
  const list = $("fleet-list");
  list.textContent = "";
  for (const vehicle of state.fleet) list.append(vehicleCard(vehicle));

  const short = el("input", { type: "text", placeholder: "Kurzname, z. B. TLFA" });
  const name = el("input", { type: "text", placeholder: "Bezeichnung" });
  const add = el("button", { className: "btn tiny primary", textContent: "Fahrzeug anlegen" });

  const submit = async () => {
    if (!short.value.trim()) { short.focus(); return; }
    add.disabled = true;
    try {
      await request("/vehicles", {
        method: "POST",
        json: {
          short: short.value.trim(),
          name: name.value.trim(),
          sort_order: state.fleet.length,
        },
      });
      await reloadFleet();
      toast(`„${short.value.trim()}“ angelegt.`);
      short.value = "";
      name.value = "";
    } catch (error) {
      failed(error);
    } finally {
      add.disabled = false;
    }
  };

  add.addEventListener("click", submit);
  for (const f of [short, name]) {
    f.addEventListener("keydown", (event) => { if (event.key === "Enter") submit(); });
  }

  list.append(el("div", { className: "cat-row new" }, [short, name, add]));
};

/* -------------------------------------------------------- Medienverwaltung */

/**
 * Laedt Dateien hoch und gibt die angelegten Mediendatensaetze zurueck.
 *
 * Wird von der Mediathek genauso benutzt wie von den Uploadknoepfen direkt
 * am Beitrag, am Fahrzeug und am Mitglied - dort muss niemand mehr erst in
 * die Mediathek wechseln und eine URL kopieren.
 */
const uploadFiles = async (files, { folder = "", silent = false } = {}) => {
  const images = [...files].filter((file) => file.type.startsWith("image/"));
  if (images.length === 0) {
    toast("Bitte Bilddateien auswählen.", "err");
    return [];
  }

  const created = [];
  for (const file of images) {
    try {
      created.push(await request("/media", {
        method: "POST",
        body: file,
        headers: {
          "Content-Type": file.type,
          // Header duerfen kein Ue enthalten, deshalb prozentkodiert.
          "X-Filename": encodeURIComponent(file.name),
          "X-Folder": encodeURIComponent(folder || ""),
        },
      }));
    } catch (error) {
      failed(error);
    }
  }

  if (created.length) {
    await reloadMedia();
    if (!silent) {
      toast(`${created.length} Bild${created.length === 1 ? "" : "er"} hochgeladen.`);
    }
  }
  return created;
};

/**
 * Kleiner Uploadknopf fuer die Stelle, an der das Bild gebraucht wird.
 * onDone bekommt die neu angelegten Mediendatensaetze.
 */
const uploadButton = (label, { folder = "", multiple = false, onDone }) => {
  const input = el("input", {
    type: "file",
    accept: "image/*",
    multiple,
    hidden: true,
  });
  const button = el("button", { className: "btn tiny ghost", type: "button", textContent: label });

  button.addEventListener("click", () => input.click());
  input.addEventListener("change", async () => {
    if (!input.files.length) return;
    button.disabled = true;
    const previous = button.textContent;
    button.textContent = "Lädt …";
    try {
      const created = await uploadFiles(input.files, { folder, silent: true });
      if (created.length) {
        await onDone(created);
        toast(`${created.length} Bild${created.length === 1 ? "" : "er"} hochgeladen.`);
      }
    } finally {
      input.value = "";
      button.disabled = false;
      button.textContent = previous;
    }
  });

  return el("span", { className: "upload-inline" }, [button, input]);
};

/** Bilder des gerade gewaehlten Ordners (null = alle). */
const mediaInFolder = () =>
  state.folder === null
    ? state.media
    : state.media.filter((item) => (item.folder || "") === state.folder);

const folderLabel = (name) => (name === "" ? "Ohne Ordner" : name);

const renderFolders = () => {
  const bar = $("media-folders");
  if (!bar) return;
  bar.textContent = "";

  const chip = (label, value, count) => {
    const active = state.folder === value;
    const button = el("button", {
      className: `folder-chip${active ? " is-on" : ""}`,
      type: "button",
      textContent: count === undefined ? label : `${label} (${count})`,
    });
    button.addEventListener("click", () => { state.folder = value; renderMedia(); });
    return button;
  };

  bar.append(chip("Alle", null, state.media.length));
  for (const folder of state.folders) {
    bar.append(chip(folderLabel(folder.name), folder.name, folder.count));
  }

  const add = el("button", { className: "folder-chip new", type: "button", textContent: "+ Ordner" });
  add.addEventListener("click", () => {
    const name = prompt("Name des neuen Ordners:");
    if (!name || !name.trim()) return;
    // Ein Ordner entsteht dadurch, dass ein Bild darin liegt. Bis dahin
    // merken wir ihn uns nur fuer die Auswahl.
    const clean = name.trim();
    if (!state.folders.some((f) => f.name === clean)) {
      state.folders = [...state.folders, { name: clean, count: 0 }];
    }
    state.folder = clean;
    renderMedia();
    toast(`Ordner „${clean}“ ausgewählt. Bilder hierher hochladen oder verschieben.`);
  });
  bar.append(add);
};

/** Auswahlfeld zum Verschieben eines Bildes in einen anderen Ordner. */
const folderSelect = (item) => {
  const select = el("select", { className: "folder-select" });
  const names = [...new Set(["", ...state.folders.map((f) => f.name)])];
  for (const name of names) {
    select.append(el("option", {
      value: name,
      textContent: folderLabel(name),
      selected: (item.folder || "") === name,
    }));
  }
  select.addEventListener("change", async () => {
    try {
      await request(`/media/${item.id}`, { method: "PATCH", json: { folder: select.value } });
      await reloadMedia();
      toast("Bild verschoben.");
    } catch (error) {
      failed(error);
    }
  });
  return select;
};

const renderMedia = () => {
  const grid = $("media-grid");
  grid.textContent = "";
  renderFolders();

  const visible = mediaInFolder();
  const empty = $("media-empty");
  empty.hidden = visible.length > 0;
  empty.textContent = state.media.length === 0
    ? "Noch keine Bilder hochgeladen."
    : "In diesem Ordner liegt noch kein Bild.";

  for (const item of visible) {
    const copy = el("button", { className: "btn tiny ghost", textContent: "URL kopieren" });
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(item.source_url);
        toast("URL kopiert.");
      } catch {
        prompt("URL:", item.source_url);
      }
    });

    const remove = el("button", { className: "btn tiny ghost danger", textContent: "Löschen" });
    remove.addEventListener("click", async () => {
      const usedBy = state.posts.filter(
        (post) => post.featured_media === item.id || post.content.rendered.includes(item.source_url)
      );
      const warning = usedBy.length
        ? `Dieses Bild wird in ${usedBy.length} Beitrag/Beiträgen verwendet. Trotzdem löschen?`
        : "Bild endgültig löschen?";
      if (!confirm(warning)) return;
      try {
        await request(`/media/${item.id}`, { method: "DELETE" });
        await reloadMedia();
        toast("Bild gelöscht.");
      } catch (error) {
        failed(error);
      }
    });

    grid.append(el("div", { className: "media-card" }, [
      el("img", { src: item.source_url, alt: item.alt_text || "", loading: "lazy" }),
      el("div", { className: "body" }, [
        el("div", { className: "name", title: item.title.rendered, textContent: item.title.rendered }),
        folderSelect(item),
        el("div", { className: "actions" }, [copy, remove]),
      ]),
    ]));
  }
};

/* ------------------------------------------------------------- Verdrahtung */

$("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const error = $("login-error");
  error.hidden = true;
  try {
    await signIn($("login-key").value.trim(), $("login-remember").checked);
  } catch (caught) {
    state.key = null;
    error.textContent = caught.message;
    error.hidden = false;
  }
});

$("logout").addEventListener("click", logout);

$("tabs").addEventListener("click", (event) => {
  const tab = event.target.closest(".tab");
  if (!tab) return;
  for (const other of document.querySelectorAll(".tab")) other.classList.toggle("is-active", other === tab);
  for (const view of document.querySelectorAll(".view")) {
    view.classList.toggle("is-active", view.id === `view-${tab.dataset.view}`);
  }
});

$("post-search").addEventListener("input", renderPostList);
$("post-status-filter").addEventListener("change", renderPostList);
$("new-post").addEventListener("click", () => openPost(null));
$("save-post").addEventListener("click", savePost);
$("delete-post").addEventListener("click", deletePost);
$("cancel-post").addEventListener("click", closeEditor);

$("toggle-html").addEventListener("click", () => {
  if (state.htmlMode) {
    // Zurueck zu Absaetzen: nur erlauben, wenn dabei nichts verloren geht.
    const parsed = parseContent($("f-content").value);
    if (!parsed.simple && !confirm("Der Text enthält HTML, das im Absatzmodus verloren geht. Fortfahren?")) return;
    const knownUrls = new Set(state.media.map((m) => m.source_url));
    state.selectedPhotos = parsed.photos.filter((url) => knownUrls.has(url));
    state.foreignPhotos = parsed.photos.filter((url) => !knownUrls.has(url));
    $("f-content").value = parsed.paragraphs.join("\n\n");
    setHtmlMode(false);
  } else {
    $("f-content").value = buildContent($("f-content").value, [...state.selectedPhotos, ...state.foreignPhotos]);
    setHtmlMode(true);
  }
});

$("media-upload").addEventListener("change", (event) => {
  uploadFiles(event.target.files, { folder: state.folder ?? "" });
  event.target.value = "";
});

const dropzone = $("dropzone");
for (const type of ["dragenter", "dragover"]) {
  dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    dropzone.classList.add("is-over");
  });
}
for (const type of ["dragleave", "drop"]) {
  dropzone.addEventListener(type, () => dropzone.classList.remove("is-over"));
}
dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  uploadFiles(event.dataTransfer.files, { folder: state.folder ?? "" });
});
dropzone.addEventListener("click", () => $("media-upload").click());

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "s" && !$("post-editor").hidden) {
    event.preventDefault();
    savePost();
  }
});

/* --------------------------------------------------------------- Autostart */

(async () => {
  const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  try {
    state.key = stored;
    await request("/session");
    showApp();
    await loadEverything();
  } catch {
    // Schluessel ist nicht mehr gueltig: normale Anmeldung zeigen.
    logout();
  }
})();
