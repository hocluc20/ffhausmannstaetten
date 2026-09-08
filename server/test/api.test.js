/**
 * Vertragstest gegen das Frontend.
 *
 * Geprueft wird nicht "irgendein JSON", sondern genau die Felder, die
 * src/common/API/BASER_API.tsx ausliest, und genau die Kategoriestruktur, die
 * src/common/bl/FilterFunctions.ts voraussetzt. Bricht einer dieser Punkte,
 * bleibt die Startseite leer - der Test faengt das ab.
 *
 * Laeuft auf einer eigenen Datenbank im Temp-Verzeichnis, die echte data/
 * bleibt unberuehrt.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "ff-api-test-"));
process.env.FF_DATA_DIR = TMP;
process.env.FF_DB_FILE = path.join(TMP, "test.sqlite");
process.env.FF_UPLOAD_DIR = path.join(TMP, "uploads");
process.env.FF_API_KEY = "test-key-1234567890";

const repo = require("../src/repository");
const app = require("../src/server");

let baseUrl;
let server;
const ids = {};

const api = (pathname, options) => fetch(`${baseUrl}/wp-json/wp/v2${pathname}`, options);

test.before(async () => {
  const einsatze = repo.createCategory({ name: "Einsätze", slug: "einsatze", description: "Alle Einsätze" });
  const fahrzeuge = repo.createCategory({ name: "Fahrzeuge", slug: "fahrzeuge", description: "Fuhrpark" });
  const mittel = repo.createCategory({ name: "Einsatzmittel", slug: "einsatzmittel", description: "Organisationen" });
  const brand = repo.createCategory({ name: "Brandeinsatz", slug: "brandeinsatz", parent: einsatze.id, description: "Brandbekämpfung" });
  const tlfa = repo.createCategory({ name: "TLFA", slug: "tlfa", parent: fahrzeuge.id, description: "Tanklöschfahrzeug" });
  repo.createCategory({ name: "MTF", slug: "mtf", parent: fahrzeuge.id, description: "Mannschaftstransportfahrzeug" });
  const rk = repo.createCategory({ name: "Rotes Kreuz", slug: "rotes-kreuz", parent: mittel.id, description: "Rettung" });
  Object.assign(ids, { einsatze: einsatze.id, fahrzeuge: fahrzeuge.id, brand: brand.id, tlfa: tlfa.id, rk: rk.id });

  const media = repo.createMedia({ filename: "brand.jpg", sourceUrl: "/uploads/brand.jpg" });
  ids.media = media.id;

  repo.createPost({
    title: "Kaminbrand",
    excerpt: "Kurzfassung",
    content: '<p>Erster Absatz.</p><p>Zweiter Absatz.</p><img src="/uploads/brand.jpg" alt="" />',
    date: "2026-07-11T07:05:00",
    featured_media: media.id,
    categories: [einsatze.id, brand.id, tlfa.id, rk.id],
  });
  repo.createPost({ title: "Aelterer Einsatz", date: "2025-01-02T10:00:00", categories: [einsatze.id] });

  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => {
  server.close();
  // Windows gibt die Datei erst nach dem Schliessen der Verbindung frei.
  require("../src/db").db.close();
  fs.rmSync(TMP, { recursive: true, force: true });
});

test("GET /categories liefert die Felder, die ICategory verlangt", async () => {
  const response = await api("/categories?per_page=100");
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-wp-total"), "7");

  const categories = await response.json();
  assert.equal(categories.length, 7);
  for (const category of categories) {
    for (const field of ["id", "name", "slug", "parent", "description"]) {
      assert.ok(field in category, `Feld ${field} fehlt`);
    }
  }

  // FilterFunctions sucht die Elternkategorien ueber genau diese Slugs.
  const slugs = categories.map((c) => c.slug);
  for (const slug of ["einsatze", "fahrzeuge", "einsatzmittel"]) {
    assert.ok(slugs.includes(slug), `Slug ${slug} fehlt`);
  }
  // Fahrzeuge: name = Kurzname, description = Langname.
  const tlfa = categories.find((c) => c.slug === "tlfa");
  assert.equal(tlfa.parent, ids.fahrzeuge);
  assert.equal(tlfa.description, "Tanklöschfahrzeug");
});

test("GET /posts?categories=..&_embed=1 liefert die Beitragsform des Frontends", async () => {
  const response = await api(`/posts?categories=${ids.einsatze}&per_page=100&_embed=1`);
  assert.equal(response.status, 200);

  const posts = await response.json();
  assert.equal(posts.length, 2);

  const post = posts[0];
  assert.equal(post.title.rendered, "Kaminbrand");
  assert.equal(post.excerpt.rendered, "Kurzfassung");
  assert.equal(post.featured_media, ids.media);
  assert.deepEqual([...post.categories].sort((a, b) => a - b), [ids.einsatze, ids.brand, ids.tlfa, ids.rk].sort((a, b) => a - b));

  // embeddedImage() im Frontend greift zuerst auf diesen Pfad zu.
  const featured = post._embedded["wp:featuredmedia"][0];
  assert.match(featured.media_details.sizes.large.source_url, /^http:\/\/127\.0\.0\.1:\d+\/uploads\/brand\.jpg$/);

  // filterTextFromContent() liest <p>, filterPhotosFromContent() <img src>.
  assert.match(post.content.rendered, /<p>Erster Absatz\.<\/p>/);
  assert.match(post.content.rendered, /<img src="http:\/\/127\.0\.0\.1:\d+\/uploads\/brand\.jpg"/);
});

test("Beitraege kommen neueste zuerst und ohne Zeitzonenverschiebung", async () => {
  const posts = await (await api(`/posts?categories=${ids.einsatze}&per_page=100`)).json();
  assert.equal(posts[0].date, "2026-07-11T07:05:00");
  assert.equal(posts[1].date, "2025-01-02T10:00:00");
  assert.ok(new Date(posts[0].date) > new Date(posts[1].date));
});

test("GET /media/:id liefert guid.rendered fuer getRenderedImage()", async () => {
  const media = await (await api(`/media/${ids.media}`)).json();
  assert.match(media.guid.rendered, /\/uploads\/brand\.jpg$/);
  assert.equal(media.source_url, media.guid.rendered);
});

test("Unbekannte IDs ergeben 404 im WordPress-Fehlerformat", async () => {
  const response = await api("/posts/9999");
  assert.equal(response.status, 404);
  const body = await response.json();
  assert.equal(body.code, "rest_not_found");
  assert.equal(body.data.status, 404);
});

test("Schreiben ohne gueltigen Key wird abgewiesen", async () => {
  const ohneKey = await api("/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Unerlaubt" }),
  });
  assert.equal(ohneKey.status, 401);

  const falscherKey = await api("/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": "falsch" },
    body: JSON.stringify({ title: "Unerlaubt" }),
  });
  assert.equal(falscherKey.status, 401);
});

test("Mit Key laesst sich ein Einsatz anlegen, aendern und loeschen", async () => {
  const headers = { "Content-Type": "application/json", "X-API-Key": process.env.FF_API_KEY };

  const created = await (await api("/posts", {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: "Technischer Einsatz",
      excerpt: "Baum über der Fahrbahn",
      content: "<p>Baum entfernt.</p>",
      date: "2026-09-01T14:00:00",
      categories: [ids.einsatze, ids.tlfa],
    }),
  })).json();
  assert.equal(created.title.rendered, "Technischer Einsatz");
  assert.equal(created.date, "2026-09-01T14:00:00");
  assert.equal(created.slug, "technischer-einsatz");

  const updated = await (await api(`/posts/${created.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ title: "Technischer Einsatz (korrigiert)" }),
  })).json();
  assert.equal(updated.title.rendered, "Technischer Einsatz (korrigiert)");
  assert.equal(updated.excerpt.rendered, "Baum über der Fahrbahn", "nicht gesetzte Felder bleiben erhalten");

  const removed = await api(`/posts/${created.id}`, { method: "DELETE", headers });
  assert.equal(removed.status, 200);
  assert.equal((await api(`/posts/${created.id}`)).status, 404);
});

test("Bild-Upload landet als abrufbare Datei mit Medien-Datensatz", async () => {
  // Kleinstes gueltiges PNG, damit kein Testbild im Repo liegen muss.
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );
  const created = await (await api("/media", {
    method: "POST",
    headers: { "Content-Type": "image/png", "X-Filename": "Einsatz Bild.png", "X-API-Key": process.env.FF_API_KEY },
    body: png,
  })).json();

  assert.equal(created.mime_type, "image/png");
  assert.match(created.source_url, /\/uploads\/\d+-einsatz-bild\.png$/);

  const download = await fetch(created.source_url);
  assert.equal(download.status, 200);
  assert.equal(Buffer.from(await download.arrayBuffer()).length, png.length);
});

test("GET /session bestaetigt einen gueltigen Schluessel und weist falsche ab", async () => {
  const ohne = await api("/session");
  assert.equal(ohne.status, 401);

  const mit = await api("/session", { headers: { "X-API-Key": process.env.FF_API_KEY } });
  assert.equal(mit.status, 200);
  assert.deepEqual(await mit.json(), { ok: true, writeEnabled: true });
});

test("status=any liefert Entwuerfe mit, der Standard nicht", async () => {
  const headers = { "Content-Type": "application/json", "X-API-Key": process.env.FF_API_KEY };
  const entwurf = await (await api("/posts", {
    method: "POST",
    headers,
    body: JSON.stringify({ title: "Noch nicht fertig", status: "draft", categories: [ids.einsatze] }),
  })).json();

  const oeffentlich = await (await api(`/posts?categories=${ids.einsatze}&per_page=100`)).json();
  assert.ok(!oeffentlich.some((p) => p.id === entwurf.id), "Entwurf darf nicht oeffentlich sein");

  const alle = await (await api(`/posts?categories=${ids.einsatze}&per_page=100&status=any`)).json();
  assert.ok(alle.some((p) => p.id === entwurf.id), "Redaktion muss den Entwurf sehen");

  const nurEntwuerfe = await (await api("/posts?per_page=100&status=draft")).json();
  assert.equal(nurEntwuerfe.length, 1);

  await api(`/posts/${entwurf.id}`, { method: "DELETE", headers });
});

test("Eine Kategorie mit Unterkategorien wird nicht geloescht", async () => {
  const headers = { "X-API-Key": process.env.FF_API_KEY };

  const abgelehnt = await api(`/categories/${ids.fahrzeuge}`, { method: "DELETE", headers });
  assert.equal(abgelehnt.status, 409, "sonst waeren TLFA und MTF verwaist");
  const fehler = await abgelehnt.json();
  assert.equal(fehler.code, "rest_has_children");
  assert.equal(fehler.data.children, 2);

  // Die Kategorie muss danach noch da sein.
  assert.equal((await api(`/categories/${ids.fahrzeuge}`)).status, 200);
});

test("Dateinamen mit Umlaut kommen prozentkodiert an und werden entpackt", async () => {
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );
  const created = await (await api("/media", {
    method: "POST",
    headers: {
      "Content-Type": "image/png",
      "X-Filename": encodeURIComponent("Übung Fernitz.png"),
      "X-API-Key": process.env.FF_API_KEY,
    },
    body: png,
  })).json();

  assert.match(created.source_url, /\/uploads\/\d+-uebung-fernitz\.png$/);
  assert.equal((await fetch(created.source_url)).status, 200);
});

test("Der kurze Pfad /api/v1 liefert dieselben Daten wie der WordPress-Pfad", async () => {
  const wp = await (await fetch(`${baseUrl}/wp-json/wp/v2/categories?per_page=100`)).json();
  const v1 = await (await fetch(`${baseUrl}/api/v1/categories?per_page=100`)).json();
  assert.deepEqual(v1, wp);
});

/* ----------------------------------------- Einsatz/Taetigkeit + Kennzahlen */

test("Kategorien tragen meta.kind, damit das Frontend Arten unterscheiden kann", async () => {
  const uebung = repo.createCategory({
    name: "Übung",
    slug: "uebung-test",
    parent: ids.einsatze,
    description: "Ausbildung",
    kind: "taetigkeit",
  });

  const response = await api("/categories?per_page=100");
  const categories = await response.json();

  const brand = categories.find((c) => c.id === ids.brand);
  const found = categories.find((c) => c.id === uebung.id);

  // FilterFunctions.readKind liest genau dieses Feld.
  assert.equal(brand.meta.kind, "einsatz", "Standard ist einsatz");
  assert.equal(found.meta.kind, "taetigkeit");

  ids.uebung = uebung.id;
});

test("Unbekannte kind-Werte fallen auf einsatz zurueck", () => {
  const created = repo.createCategory({
    name: "Unsinn",
    slug: "unsinn-test",
    parent: ids.einsatze,
    kind: "quatsch",
  });
  assert.equal(created.kind, "einsatz");
  repo.deleteCategory(created.id);
});

test("GET /settings liefert gepflegte und berechnete Kennzahlen", async () => {
  const response = await fetch(`${baseUrl}/api/v1/settings`);
  assert.equal(response.status, 200);
  const settings = await response.json();

  // Genau die Schluessel, die fetchSettings() und die Adminoberflaeche lesen.
  for (const key of [
    "stats.members",
    "stats.vehicles",
    "stats.foundedYear",
    "stats.year",
    "stats.operationsThisYear",
  ]) {
    assert.ok(key in settings, `${key} fehlt`);
  }
  assert.equal(settings["stats.year"], String(new Date().getFullYear()));
});

test("Kennzahlen lassen sich pflegen, die Einsatzzahl aber nicht", async () => {
  const write = (body) =>
    fetch(`${baseUrl}/api/v1/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-API-Key": process.env.FF_API_KEY },
      body: JSON.stringify(body),
    });

  const ok = await write({ "stats.members": "123" });
  assert.equal(ok.status, 200);
  assert.equal((await ok.json())["stats.members"], "123");

  // Die Einsatzzahl wird gezaehlt und darf nicht von Hand gesetzt werden.
  const rejected = await write({ "stats.operationsThisYear": "999" });
  assert.equal(rejected.status, 400);
  assert.equal((await rejected.json()).code, "rest_readonly_setting");

  const withoutKey = await fetch(`${baseUrl}/api/v1/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "stats.members": "1" }),
  });
  assert.equal(withoutKey.status, 401);
});

test("Die Einsatzzahl zaehlt nur Arten vom kind 'einsatz'", async () => {
  const year = new Date().getFullYear();
  const before = repo.countOperations(year);

  // Ein Einsatz und eine Taetigkeit im laufenden Jahr.
  const einsatz = repo.createPost({
    title: "Zaehltest Brand",
    date: `${year}-03-04T10:00:00`,
    categories: [ids.einsatze, ids.brand],
  });
  const taetigkeit = repo.createPost({
    title: "Zaehltest Übung",
    date: `${year}-03-05T10:00:00`,
    categories: [ids.einsatze, ids.uebung],
  });

  assert.equal(repo.countOperations(year), before + 1, "nur der Einsatz zaehlt");

  // Wird die Art im Adminbereich auf "einsatz" umgestellt, zaehlt der
  // Eintrag ab sofort mit - genau das erwartet die Redaktion.
  repo.updateCategory(ids.uebung, { kind: "einsatz" });
  assert.equal(repo.countOperations(year), before + 2);
  repo.updateCategory(ids.uebung, { kind: "taetigkeit" });

  // Fahrzeuge sind keine Einsatzart, auch wenn sie die Standard-kind tragen.
  const nurFahrzeug = repo.createPost({
    title: "Zaehltest ohne Art",
    date: `${year}-03-06T10:00:00`,
    categories: [ids.einsatze, ids.tlfa],
  });
  assert.equal(repo.countOperations(year), before + 1, "Fahrzeug allein zaehlt nicht");

  repo.deletePost(einsatz.row.id);
  repo.deletePost(taetigkeit.row.id);
  repo.deletePost(nurFahrzeug.row.id);
});


/* ------------------------------------------------- Mannschaft und Fuhrpark */

const v1 = (pathname, options) => fetch(`${baseUrl}/api/v1${pathname}`, options);
const withKey = (json, method = "POST") => ({
  method,
  headers: { "Content-Type": "application/json", "X-API-Key": process.env.FF_API_KEY },
  body: JSON.stringify(json),
});

test("Mannschaft: anlegen, lesen, aendern, loeschen", async () => {
  const created = await v1("/members", withKey({
    name: "LM Testperson",
    rank: "Loeschmeister",
    function: "Zeugwart",
    team: "Beauftragte",
    sort_order: 3,
  }));
  assert.equal(created.status, 201);
  const member = await created.json();

  // Genau die Felder, die fetchMembers() ausliest.
  for (const key of ["id", "name", "rank", "function", "team", "sort_order", "portrait_url"]) {
    assert.ok(key in member, `${key} fehlt`);
  }
  assert.equal(member.team, "Beauftragte");

  const list = await (await v1("/members")).json();
  assert.ok(list.some((m) => m.id === member.id));

  const patched = await (await v1(`/members/${member.id}`, withKey({ function: "Kassier" }, "PATCH"))).json();
  assert.equal(patched.function, "Kassier");
  assert.equal(patched.name, "LM Testperson", "unveraenderte Felder bleiben stehen");

  const removed = await v1(`/members/${member.id}`, { method: "DELETE", headers: { "X-API-Key": process.env.FF_API_KEY } });
  assert.equal(removed.status, 200);
  const after = await (await v1("/members")).json();
  assert.ok(!after.some((m) => m.id === member.id));
});

test("Mannschaft: Schreiben ohne Schluessel wird abgewiesen", async () => {
  const response = await v1("/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Ohne Schluessel" }),
  });
  assert.equal(response.status, 401);
});

test("Mannschaft: inaktive Mitglieder nur auf Anfrage", async () => {
  const created = await (await v1("/members", withKey({ name: "Ausgetreten", active: false }))).json();

  const publicList = await (await v1("/members")).json();
  assert.ok(!publicList.some((m) => m.id === created.id), "oeffentlich ausgeblendet");

  const adminList = await (await v1("/members?include_inactive=1")).json();
  assert.ok(adminList.some((m) => m.id === created.id), "fuer die Redaktion sichtbar");

  await v1(`/members/${created.id}`, { method: "DELETE", headers: { "X-API-Key": process.env.FF_API_KEY } });
});

test("Fuhrpark liefert die Felder, die die Detailseite braucht", async () => {
  const created = await v1("/vehicles", withKey({
    short: "TESTF",
    name: "Testfahrzeug",
    call_sign: "Test Eins",
    description: "Beschreibung",
    specs: [{ label: "Baujahr", value: "2020" }],
    tasks: ["Pruefen"],
    photos: [{ url: "/uploads/test.webp", caption: "Vorne" }],
    category_id: ids.tlfa,
  }));
  assert.equal(created.status, 201);
  const vehicle = await created.json();

  for (const key of ["id", "slug", "short", "name", "call_sign", "description", "specs", "tasks", "photos", "category_id"]) {
    assert.ok(key in vehicle, `${key} fehlt`);
  }
  assert.equal(vehicle.slug, "testf", "Slug wird aus dem Kurznamen gebildet");
  assert.deepEqual(vehicle.specs, [{ label: "Baujahr", value: "2020" }]);
  assert.deepEqual(vehicle.tasks, ["Pruefen"]);
  assert.equal(vehicle.category_id, ids.tlfa);

  // Relative Uploadpfade werden wie bei den Medien absolut ausgeliefert.
  assert.match(vehicle.photos[0].url, /^http:\/\/127\.0\.0\.1:\d+\/uploads\/test\.webp$/);
  assert.equal(vehicle.photos[0].caption, "Vorne");

  ids.vehicle = vehicle.id;
});

test("Fuhrpark ist ueber Slug und ueber ID abrufbar", async () => {
  const bySlug = await (await v1("/vehicles/testf")).json();
  const byId = await (await v1(`/vehicles/${ids.vehicle}`)).json();
  assert.equal(bySlug.id, ids.vehicle);
  assert.equal(byId.slug, "testf");

  const missing = await v1("/vehicles/gibtesnicht");
  assert.equal(missing.status, 404);
});

test("Fuhrpark: aendern und loeschen", async () => {
  const patched = await (await v1(`/vehicles/${ids.vehicle}`, withKey({
    specs: [{ label: "Baujahr", value: "2021" }, { label: "Sitze", value: "6" }],
  }, "PATCH"))).json();
  assert.equal(patched.specs.length, 2);
  assert.equal(patched.short, "TESTF", "unveraenderte Felder bleiben stehen");

  const removed = await v1(`/vehicles/${ids.vehicle}`, {
    method: "DELETE",
    headers: { "X-API-Key": process.env.FF_API_KEY },
  });
  assert.equal(removed.status, 200);
  assert.equal((await v1(`/vehicles/${ids.vehicle}`)).status, 404);
});

test("Kaputte JSON-Spalten kippen die Fahrzeugliste nicht", () => {
  const vehicle = repo.createVehicle({ short: "KAPUTT" });
  require("../src/db").db
    .prepare("UPDATE vehicles SET specs = 'kein json', photos = '{}' WHERE id = ?")
    .run(vehicle.id);

  const found = repo.getVehicle(vehicle.id);
  assert.deepEqual(found.specs, [], "faellt auf eine leere Liste zurueck");
  assert.deepEqual(found.photos, []);
  assert.doesNotThrow(() => repo.listVehicles());

  repo.deleteVehicle(vehicle.id);
});

/* ---------------------------------------------------- Medienordner + Upload */

test("Bilder landen im angegebenen Ordner und lassen sich verschieben", async () => {
  const upload = await fetch(`${baseUrl}/api/v1/media`, {
    method: "POST",
    headers: {
      "Content-Type": "image/png",
      "X-Filename": encodeURIComponent("ordner-test.png"),
      "X-Folder": encodeURIComponent("Mannschaft"),
      "X-API-Key": process.env.FF_API_KEY,
    },
    body: Buffer.from("89504e470d0a1a0a", "hex"),
  });
  assert.equal(upload.status, 201);
  const media = await upload.json();
  assert.equal(media.folder, "Mannschaft");

  // Nach Ordner filtern.
  const inFolder = await (await fetch(`${baseUrl}/api/v1/media?folder=Mannschaft&per_page=100`)).json();
  assert.ok(inFolder.some((m) => m.id === media.id));
  const elsewhere = await (await fetch(`${baseUrl}/api/v1/media?folder=Fahrzeuge&per_page=100`)).json();
  assert.ok(!elsewhere.some((m) => m.id === media.id));

  // Verschieben.
  const moved = await (await fetch(`${baseUrl}/api/v1/media/${media.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "X-API-Key": process.env.FF_API_KEY },
    body: JSON.stringify({ folder: "Fahrzeuge" }),
  })).json();
  assert.equal(moved.folder, "Fahrzeuge");

  ids.folderMedia = media.id;
});

test("Ordnerliste zaehlt die Bilder je Ordner", async () => {
  const folders = await (await fetch(`${baseUrl}/api/v1/media-folders`)).json();
  const fahrzeuge = folders.find((f) => f.name === "Fahrzeuge");
  assert.ok(fahrzeuge && fahrzeuge.count >= 1);
  // Unsortierte stehen als leerer Name vorne.
  assert.ok(folders.every((f) => typeof f.name === "string" && typeof f.count === "number"));
});

test("Ordnernamen werden entschaerft", () => {
  // Backslash ueber den Zeichencode, damit ihn keine Escaping-Ebene frisst.
  const BS = String.fromCharCode(92);
  assert.equal(repo.cleanFolder("  Ein/Zwei" + BS + "Drei  "), "Ein Zwei Drei");
  assert.equal(repo.cleanFolder(undefined), "");
});

test("Ordner umbenennen verschiebt alle Bilder", async () => {
  const response = await fetch(`${baseUrl}/api/v1/media-folders`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "X-API-Key": process.env.FF_API_KEY },
    body: JSON.stringify({ from: "Fahrzeuge", to: "Fuhrpark" }),
  });
  assert.equal(response.status, 200);
  const { moved, folders } = await response.json();
  assert.ok(moved >= 1);
  assert.ok(folders.some((f) => f.name === "Fuhrpark"));
  assert.ok(!folders.some((f) => f.name === "Fahrzeuge"));

  // zuruecksetzen
  await fetch(`${baseUrl}/api/v1/media-folders`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "X-API-Key": process.env.FF_API_KEY },
    body: JSON.stringify({ from: "Fuhrpark", to: "Fahrzeuge" }),
  });

  await fetch(`${baseUrl}/api/v1/media/${ids.folderMedia}`, {
    method: "DELETE",
    headers: { "X-API-Key": process.env.FF_API_KEY },
  });
});

test("Sichtbarkeit der Mannschaftsseite ist eine Einstellung", async () => {
  const before = await (await fetch(`${baseUrl}/api/v1/settings`)).json();
  assert.equal(before["pages.membersVisible"], "1", "standardmaessig sichtbar");

  const off = await (await fetch(`${baseUrl}/api/v1/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "X-API-Key": process.env.FF_API_KEY },
    body: JSON.stringify({ "pages.membersVisible": "0" }),
  })).json();
  assert.equal(off["pages.membersVisible"], "0");

  await fetch(`${baseUrl}/api/v1/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "X-API-Key": process.env.FF_API_KEY },
    body: JSON.stringify({ "pages.membersVisible": "1" }),
  });
});

test("Portrait wird ueber portrait_media verknuepft und als URL geliefert", async () => {
  const media = repo.createMedia({
    filename: "portrait.jpg",
    sourceUrl: "/uploads/portrait.jpg",
    folder: "Mannschaft",
  });
  const member = await (await fetch(`${baseUrl}/api/v1/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": process.env.FF_API_KEY },
    body: JSON.stringify({ name: "Mit Foto", portrait_media: media.id }),
  })).json();

  assert.equal(member.portrait_media, media.id);
  assert.match(member.portrait_url, /\/uploads\/portrait\.jpg$/);

  // Foto wieder entfernen: portrait_media 0 ergibt eine leere URL.
  const cleared = await (await fetch(`${baseUrl}/api/v1/members/${member.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "X-API-Key": process.env.FF_API_KEY },
    body: JSON.stringify({ portrait_media: 0 }),
  })).json();
  assert.equal(cleared.portrait_url, "");

  await fetch(`${baseUrl}/api/v1/members/${member.id}`, {
    method: "DELETE",
    headers: { "X-API-Key": process.env.FF_API_KEY },
  });
  repo.deleteMedia(media.id);
});
