/** Datenzugriff. Alle SQL-Abfragen leben hier, die Routen bleiben duenn. */
const { db } = require("./db");

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "eintrag";

/** Aktueller Zeitpunkt als naive Ortszeit, im selben Format wie gespeicherte Daten. */
const nowStamp = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T` +
         `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

/**
 * Normalisiert ein Eingabedatum auf "YYYY-MM-DDTHH:MM:SS".
 *
 * Ein Datum ohne Zeitzone wird bewusst NICHT umgerechnet: WordPress liefert in
 * `date` ebenfalls Ortszeit ohne Offset, und das Frontend parst den Wert mit
 * new Date(...) wieder als Ortszeit. Ein Umweg ueber toISOString() haette
 * 18:42 im Sommer als 16:42 gespeichert.
 */
const toStoredDate = (value) => {
  if (!value) return nowStamp();
  const raw = String(value).trim();
  const naive = /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2})(:\d{2})?)?$/.exec(raw);
  if (naive) return `${naive[1]}T${naive[2] ?? "00:00"}${naive[3] ?? ":00"}`;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return nowStamp();
  // Mit Zeitzone im Eingabewert: in Ortszeit umrechnen, dann Offset abschneiden.
  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 19);
};

/** Haengt -2, -3 ... an, bis der Slug in der Tabelle frei ist. */
const uniqueSlug = (table, base, ownId = null) => {
  const taken = db.prepare(`SELECT id FROM ${table} WHERE slug = ? AND id IS NOT ?`);
  let slug = base;
  let n = 2;
  while (taken.get(slug, ownId)) slug = `${base}-${n++}`;
  return slug;
};

/* ---------------------------------------------------------------- Kategorien */

const listCategories = ({ perPage = 100, page = 1, parent, slug } = {}) => {
  const where = [];
  const params = {};
  if (parent !== undefined) { where.push("c.parent = @parent"); params.parent = parent; }
  if (slug) { where.push("c.slug = @slug"); params.slug = slug; }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const total = db.prepare(`SELECT COUNT(*) AS n FROM categories c ${clause}`).get(params).n;
  const rows = db.prepare(`
    SELECT c.*, (SELECT COUNT(*) FROM post_categories pc WHERE pc.category_id = c.id) AS count
    FROM categories c ${clause}
    ORDER BY c.parent, c.name
    LIMIT @limit OFFSET @offset
  `).all({ ...params, limit: perPage, offset: (page - 1) * perPage });

  return { rows, total };
};

const getCategory = (id) => db.prepare(`
  SELECT c.*, (SELECT COUNT(*) FROM post_categories pc WHERE pc.category_id = c.id) AS count
  FROM categories c WHERE c.id = ?
`).get(id);

/** Nur diese beiden Werte sind zulaessig; alles andere faellt auf "einsatz" zurueck. */
const KINDS = new Set(["einsatz", "taetigkeit"]);
const normalizeKind = (value, fallback = "einsatz") =>
  KINDS.has(String(value)) ? String(value) : fallback;

const createCategory = ({ name, slug, parent = 0, description = "", kind }) => {
  const info = db.prepare(
    "INSERT INTO categories (name, slug, parent, description, kind) VALUES (?, ?, ?, ?, ?)"
  ).run(
    name,
    uniqueSlug("categories", slug ? slugify(slug) : slugify(name)),
    parent,
    description,
    normalizeKind(kind)
  );
  return getCategory(info.lastInsertRowid);
};

const updateCategory = (id, patch) => {
  const current = getCategory(id);
  if (!current) return undefined;
  const next = {
    name: patch.name ?? current.name,
    slug: patch.slug ? uniqueSlug("categories", slugify(patch.slug), id) : current.slug,
    parent: patch.parent ?? current.parent,
    description: patch.description ?? current.description,
    kind: patch.kind === undefined ? current.kind : normalizeKind(patch.kind, current.kind),
  };
  db.prepare(
    "UPDATE categories SET name = @name, slug = @slug, parent = @parent, description = @description, kind = @kind WHERE id = @id"
  ).run({ ...next, id });
  return getCategory(id);
};

const deleteCategory = (id) => db.prepare("DELETE FROM categories WHERE id = ?").run(id).changes > 0;

/* -------------------------------------------------------------------- Medien */

const getMedia = (id) => db.prepare("SELECT * FROM media WHERE id = ?").get(id);

/** Ordnernamen bleiben schlicht: getrimmt, ohne Schraegstriche. */
const cleanFolder = (value) =>
  String(value ?? "").trim().replace(/[\\/]+/g, " ").replace(/\s+/g, " ").slice(0, 60);

const listMedia = ({ perPage = 100, page = 1, folder } = {}) => {
  const where = folder === undefined ? "" : "WHERE folder = @folder";
  const params = folder === undefined ? {} : { folder: cleanFolder(folder) };
  const total = db.prepare(`SELECT COUNT(*) AS n FROM media ${where}`).get(params).n;
  const rows = db.prepare(
    `SELECT * FROM media ${where} ORDER BY id DESC LIMIT @limit OFFSET @offset`
  ).all({ ...params, limit: perPage, offset: (page - 1) * perPage });
  return { rows, total };
};

/** Alle belegten Ordner mit Anzahl, alphabetisch. */
const listMediaFolders = () =>
  db.prepare(`
    SELECT folder AS name, COUNT(*) AS count
    FROM media
    GROUP BY folder
    ORDER BY (folder = '') DESC, folder COLLATE NOCASE
  `).all();

const createMedia = ({ filename, mimeType = "image/jpeg", sourceUrl, altText = "", folder = "" }) => {
  const info = db.prepare(
    "INSERT INTO media (filename, mime_type, source_url, alt_text, folder) VALUES (?, ?, ?, ?, ?)"
  ).run(filename, mimeType, sourceUrl, altText, cleanFolder(folder));
  return getMedia(info.lastInsertRowid);
};

const updateMedia = (id, patch = {}) => {
  const current = getMedia(id);
  if (!current) return undefined;
  db.prepare("UPDATE media SET alt_text = @alt_text, folder = @folder WHERE id = @id").run({
    id,
    alt_text: patch.alt_text ?? current.alt_text,
    folder: patch.folder === undefined ? current.folder : cleanFolder(patch.folder),
  });
  return getMedia(id);
};

/** Ordner umbenennen bzw. leeren; gibt die Zahl der verschobenen Bilder zurueck. */
const renameMediaFolder = (from, to) =>
  db.prepare("UPDATE media SET folder = ? WHERE folder = ?")
    .run(cleanFolder(to), cleanFolder(from)).changes;
const deleteMedia = (id) => db.prepare("DELETE FROM media WHERE id = ?").run(id).changes > 0;

/* ------------------------------------------------------------------ Beitraege */

const categoryIdsOf = db.prepare("SELECT category_id FROM post_categories WHERE post_id = ?");

const withRelations = (row) => {
  if (!row) return undefined;
  return {
    row,
    categories: categoryIdsOf.all(row.id).map((r) => r.category_id),
    media: row.featured_media ? getMedia(row.featured_media) : undefined,
  };
};

const listPosts = ({ perPage = 10, page = 1, categories = [], search, order = "desc", status = "publish" } = {}) => {
  // "any" liefert auch Entwuerfe - die Adminoberflaeche braucht das, die
  // oeffentliche Seite fragt weiterhin nur veroeffentlichte Beitraege ab.
  const where = ["1 = 1"];
  const params = { limit: perPage, offset: (page - 1) * perPage };
  if (status && status !== "any") { where.push("p.status = @status"); params.status = status; }

  if (categories.length) {
    // Ein Beitrag zaehlt, sobald er in EINER der angefragten Kategorien haengt
    // (genau wie ?categories=1,2 in WordPress).
    where.push(`p.id IN (SELECT post_id FROM post_categories WHERE category_id IN (${
      categories.map((_, i) => `@cat${i}`).join(",")
    }))`);
    categories.forEach((c, i) => { params[`cat${i}`] = c; });
  }
  if (search) { where.push("(p.title LIKE @q OR p.content LIKE @q)"); params.q = `%${search}%`; }

  const clause = `WHERE ${where.join(" AND ")}`;
  const total = db.prepare(`SELECT COUNT(*) AS n FROM posts p ${clause}`).get(params).n;
  const rows = db.prepare(
    `SELECT p.* FROM posts p ${clause} ORDER BY p.date ${order === "asc" ? "ASC" : "DESC"} LIMIT @limit OFFSET @offset`
  ).all(params);

  return { items: rows.map(withRelations), total };
};

const getPost = (id) => withRelations(db.prepare("SELECT * FROM posts WHERE id = ?").get(id));

const setPostCategories = (postId, categoryIds = []) => {
  db.prepare("DELETE FROM post_categories WHERE post_id = ?").run(postId);
  const link = db.prepare("INSERT OR IGNORE INTO post_categories (post_id, category_id) VALUES (?, ?)");
  for (const id of categoryIds) {
    if (getCategory(id)) link.run(postId, id);
  }
};

const createPost = (input) => {
  const now = nowStamp();
  const date = toStoredDate(input.date);
  const tx = db.transaction(() => {
    const info = db.prepare(`
      INSERT INTO posts (slug, title, excerpt, content, date, modified, status, featured_media)
      VALUES (@slug, @title, @excerpt, @content, @date, @modified, @status, @featured_media)
    `).run({
      slug: uniqueSlug("posts", slugify(input.slug || input.title)),
      title: input.title ?? "",
      excerpt: input.excerpt ?? "",
      content: input.content ?? "",
      date,
      modified: now,
      status: input.status ?? "publish",
      featured_media: input.featured_media ?? 0,
    });
    setPostCategories(info.lastInsertRowid, input.categories ?? []);
    return info.lastInsertRowid;
  });
  return getPost(tx());
};

const updatePost = (id, patch) => {
  const existing = getPost(id);
  if (!existing) return undefined;
  const current = existing.row;
  const tx = db.transaction(() => {
    db.prepare(`
      UPDATE posts SET slug = @slug, title = @title, excerpt = @excerpt, content = @content,
                       date = @date, modified = @modified, status = @status, featured_media = @featured_media
      WHERE id = @id
    `).run({
      id,
      slug: patch.slug ? uniqueSlug("posts", slugify(patch.slug), id) : current.slug,
      title: patch.title ?? current.title,
      excerpt: patch.excerpt ?? current.excerpt,
      content: patch.content ?? current.content,
      date: patch.date ? toStoredDate(patch.date) : current.date,
      modified: nowStamp(),
      status: patch.status ?? current.status,
      featured_media: patch.featured_media ?? current.featured_media,
    });
    if (patch.categories) setPostCategories(id, patch.categories);
  });
  tx();
  return getPost(id);
};

const deletePost = (id) => db.prepare("DELETE FROM posts WHERE id = ?").run(id).changes > 0;

/* ---------------------------------------------------------------- Mannschaft */

/** Reihenfolge: erst Gruppe (wie eingetragen), dann sort_order, dann Name. */
const listMembers = ({ includeInactive = false } = {}) => {
  const where = includeInactive ? "" : "WHERE active = 1";
  return db.prepare(`
    SELECT * FROM members ${where}
    ORDER BY sort_order, name
  `).all();
};

const getMember = (id) => db.prepare("SELECT * FROM members WHERE id = ?").get(id);

const createMember = (input = {}) => {
  const info = db.prepare(`
    INSERT INTO members (name, rank, function, team, sort_order, portrait_media, active)
    VALUES (@name, @rank, @function, @team, @sort_order, @portrait_media, @active)
  `).run({
    name: input.name ?? "",
    rank: input.rank ?? "",
    function: input.function ?? "",
    team: input.team ?? "Mannschaft",
    sort_order: Number(input.sort_order) || 0,
    portrait_media: Number(input.portrait_media) || 0,
    active: input.active === false || input.active === 0 ? 0 : 1,
  });
  return getMember(info.lastInsertRowid);
};

const updateMember = (id, patch = {}) => {
  const current = getMember(id);
  if (!current) return undefined;
  db.prepare(`
    UPDATE members SET name = @name, rank = @rank, function = @function, team = @team,
                       sort_order = @sort_order, portrait_media = @portrait_media, active = @active
    WHERE id = @id
  `).run({
    id,
    name: patch.name ?? current.name,
    rank: patch.rank ?? current.rank,
    function: patch.function ?? current.function,
    team: patch.team ?? current.team,
    sort_order: patch.sort_order === undefined ? current.sort_order : Number(patch.sort_order) || 0,
    portrait_media:
      patch.portrait_media === undefined ? current.portrait_media : Number(patch.portrait_media) || 0,
    active: patch.active === undefined ? current.active : (patch.active ? 1 : 0),
  });
  return getMember(id);
};

const deleteMember = (id) => db.prepare("DELETE FROM members WHERE id = ?").run(id).changes > 0;

/* ------------------------------------------------------------------ Fuhrpark */

/**
 * JSON-Spalten robust lesen: eine kaputte Zeile darf nicht die ganze
 * Fahrzeugliste zum Absturz bringen.
 */
const parseJson = (value, fallback) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const hydrateVehicle = (row) => {
  if (!row) return undefined;
  return {
    ...row,
    specs: parseJson(row.specs, []),
    tasks: parseJson(row.tasks, []),
    photos: parseJson(row.photos, []),
    active: row.active === 1,
  };
};

const listVehicles = ({ includeInactive = false } = {}) => {
  const where = includeInactive ? "" : "WHERE active = 1";
  return db.prepare(`SELECT * FROM vehicles ${where} ORDER BY sort_order, short`)
    .all()
    .map(hydrateVehicle);
};

const getVehicle = (id) => hydrateVehicle(db.prepare("SELECT * FROM vehicles WHERE id = ?").get(id));
const getVehicleBySlug = (slug) =>
  hydrateVehicle(db.prepare("SELECT * FROM vehicles WHERE slug = ?").get(slug));

/** specs/tasks/photos duerfen als Array oder als JSON-Text ankommen. */
const asJsonText = (value, fallback = "[]") => {
  if (value === undefined) return undefined;
  if (typeof value === "string") return parseJson(value, []).length ? value : fallback;
  return Array.isArray(value) ? JSON.stringify(value) : fallback;
};

const createVehicle = (input = {}) => {
  const info = db.prepare(`
    INSERT INTO vehicles (slug, short, name, call_sign, description, specs, tasks, photos,
                          category_id, sort_order, active)
    VALUES (@slug, @short, @name, @call_sign, @description, @specs, @tasks, @photos,
            @category_id, @sort_order, @active)
  `).run({
    slug: uniqueSlug("vehicles", slugify(input.slug || input.short || input.name)),
    short: input.short ?? "",
    name: input.name ?? "",
    call_sign: input.call_sign ?? "",
    description: input.description ?? "",
    specs: asJsonText(input.specs) ?? "[]",
    tasks: asJsonText(input.tasks) ?? "[]",
    photos: asJsonText(input.photos) ?? "[]",
    category_id: Number(input.category_id) || 0,
    sort_order: Number(input.sort_order) || 0,
    active: input.active === false || input.active === 0 ? 0 : 1,
  });
  return getVehicle(info.lastInsertRowid);
};

const updateVehicle = (id, patch = {}) => {
  const current = db.prepare("SELECT * FROM vehicles WHERE id = ?").get(id);
  if (!current) return undefined;
  db.prepare(`
    UPDATE vehicles SET slug = @slug, short = @short, name = @name, call_sign = @call_sign,
                        description = @description, specs = @specs, tasks = @tasks, photos = @photos,
                        category_id = @category_id, sort_order = @sort_order, active = @active
    WHERE id = @id
  `).run({
    id,
    slug: patch.slug ? uniqueSlug("vehicles", slugify(patch.slug), id) : current.slug,
    short: patch.short ?? current.short,
    name: patch.name ?? current.name,
    call_sign: patch.call_sign ?? current.call_sign,
    description: patch.description ?? current.description,
    specs: asJsonText(patch.specs) ?? current.specs,
    tasks: asJsonText(patch.tasks) ?? current.tasks,
    photos: asJsonText(patch.photos) ?? current.photos,
    category_id: patch.category_id === undefined ? current.category_id : Number(patch.category_id) || 0,
    sort_order: patch.sort_order === undefined ? current.sort_order : Number(patch.sort_order) || 0,
    active: patch.active === undefined ? current.active : (patch.active ? 1 : 0),
  });
  return getVehicle(id);
};

const deleteVehicle = (id) => db.prepare("DELETE FROM vehicles WHERE id = ?").run(id).changes > 0;

/* ------------------------------------------------------------ Einstellungen */

/**
 * Frei pflegbare Kennzahlen der Startseite.
 *
 * Die Zahl der Einsaetze steht bewusst NICHT hier: sie wird aus den
 * tatsaechlich erfassten Einsaetzen des laufenden Jahres gezaehlt, damit sie
 * nicht von Hand nachgepflegt werden muss und nie veraltet.
 */
const SETTING_DEFAULTS = {
  // "1" = Seite ist oeffentlich sichtbar, "0" = ausgeblendet.
  "pages.membersVisible": "1",
  "stats.members": "104",
  "stats.vehicles": "5",
  "stats.foundedYear": "1889",
};

const listSettings = () => {
  const stored = Object.fromEntries(
    db.prepare("SELECT key, value FROM settings").all().map((r) => [r.key, r.value])
  );
  return { ...SETTING_DEFAULTS, ...stored };
};

const setSettings = (patch = {}) => {
  const write = db.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (@key, @value, strftime('%Y-%m-%dT%H:%M:%S', 'now'))
    ON CONFLICT(key) DO UPDATE SET value = @value, updated_at = excluded.updated_at
  `);
  const tx = db.transaction((entries) => {
    for (const [key, value] of entries) write.run({ key: String(key), value: String(value) });
  });
  tx(Object.entries(patch));
  return listSettings();
};

/**
 * Zaehlt die Beitraege eines Jahres, deren Art als "einsatz" gefuehrt wird.
 * Uebungen und sonstige Taetigkeiten bleiben dabei aussen vor.
 *
 * Nur Unterkategorien von "einsatze" zaehlen als Art. Fahrzeuge und
 * Einsatzmittel tragen zwar ebenfalls eine kind-Spalte (Standardwert), sind
 * aber keine Einsatzart - ohne diese Einschraenkung wuerde jeder Beitrag
 * ueber sein Fahrzeug mitgezaehlt.
 */
const countOperations = (year) => db.prepare(`
  SELECT COUNT(DISTINCT p.id) AS n
  FROM posts p
  JOIN post_categories pc ON pc.post_id = p.id
  JOIN categories c       ON c.id = pc.category_id
  WHERE p.status = 'publish'
    AND c.kind = 'einsatz'
    AND c.parent = (SELECT id FROM categories WHERE slug = 'einsatze')
    AND strftime('%Y', p.date) = @year
`).get({ year: String(year) }).n;

module.exports = {
  slugify,
  listSettings, setSettings, countOperations, SETTING_DEFAULTS,
  listMembers, getMember, createMember, updateMember, deleteMember,
  listVehicles, getVehicle, getVehicleBySlug, createVehicle, updateVehicle, deleteVehicle,
  listCategories, getCategory, createCategory, updateCategory, deleteCategory,
  listMedia, getMedia, createMedia, updateMedia, deleteMedia,
  listMediaFolders, renameMediaFolder, cleanFolder,
  listPosts, getPost, createPost, updatePost, deletePost,
};
