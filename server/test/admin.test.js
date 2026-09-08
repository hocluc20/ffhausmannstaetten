/**
 * Bedient die Redaktionsoberflaeche wie ein Mensch - im Browser von jsdom,
 * gegen einen echten laufenden Server mit echter Datenbank.
 *
 * Ein Syntaxcheck wuerde nicht auffallen lassen, dass die Seite beim Laden
 * mit einem TypeError abbricht und leer bleibt. Hier wird deshalb wirklich
 * angemeldet, ausgefuellt und gespeichert - und danach ueber die API
 * geprueft, ob der Einsatz so in der Datenbank steht, wie ihn das Frontend
 * spaeter braucht.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "ff-admin-test-"));
process.env.FF_DATA_DIR = TMP;
process.env.FF_DB_FILE = path.join(TMP, "test.sqlite");
process.env.FF_UPLOAD_DIR = path.join(TMP, "uploads");
process.env.FF_API_KEY = "admin-test-key-0123456789";

const repo = require("../src/repository");
const app = require("../src/server");

const ADMIN = path.join(__dirname, "..", "public", "admin");
const KEY = process.env.FF_API_KEY;

let server;
let baseUrl;
let dom;
let win;

const api = (pathname, options) => fetch(`${baseUrl}/api/v1${pathname}`, options);
const $ = (id) => win.document.getElementById(id);
/** Der Oberflaeche Zeit fuer ihre await-Ketten geben. */
const settle = async (rounds = 6) => {
  for (let i = 0; i < rounds; i += 1) await new Promise((resolve) => setTimeout(resolve, 15));
};

test.before(async () => {
  const einsatze = repo.createCategory({ name: "Einsätze", slug: "einsatze" });
  const fahrzeuge = repo.createCategory({ name: "Fahrzeuge", slug: "fahrzeuge" });
  const mittel = repo.createCategory({ name: "Einsatzmittel", slug: "einsatzmittel" });
  repo.createCategory({ name: "Brandeinsatz", slug: "brandeinsatz", parent: einsatze.id, kind: "einsatz" });
  repo.createCategory({ name: "Übung", slug: "uebung", parent: einsatze.id, kind: "taetigkeit" });
  repo.createCategory({ name: "TLFA", slug: "tlfa", parent: fahrzeuge.id, description: "Tanklöschfahrzeug" });
  repo.createCategory({ name: "Rotes Kreuz", slug: "rotes-kreuz", parent: mittel.id });
  repo.createMedia({ filename: "bild.jpg", sourceUrl: "/uploads/bild.jpg" });
  repo.createPost({ title: "Vorhandener Einsatz", date: "2026-01-05T10:00:00", categories: [einsatze.id] });

  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  dom = new JSDOM(fs.readFileSync(path.join(ADMIN, "index.html"), "utf8"), {
    url: `${baseUrl}/admin/`,
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  win = dom.window;

  // jsdom bringt kein fetch mit: das echte von Node durchreichen.
  win.fetch = (input, init) => fetch(new URL(input, baseUrl).href, init);
  win.confirm = () => true;
  win.alert = () => {};

  for (const file of ["content.js", "admin.js"]) {
    win.eval(fs.readFileSync(path.join(ADMIN, file), "utf8"));
  }
  await settle();
});

test.after(() => {
  dom.window.close();
  server.close();
  require("../src/db").db.close();
  fs.rmSync(TMP, { recursive: true, force: true });
});

test("Die Seite laedt ohne Fehler und zeigt zuerst die Anmeldung", () => {
  assert.equal($("login").hidden, false);
  assert.equal($("app").hidden, true);
  assert.ok(win.FFContent, "content.js muss geladen sein");
});

test("Ein falscher Schlüssel wird abgewiesen und angezeigt", async () => {
  $("login-key").value = "falsch";
  $("login-form").dispatchEvent(new win.Event("submit"));
  await settle();

  assert.equal($("login-error").hidden, false);
  assert.match($("login-error").textContent, /abgelehnt|Ungueltig/i);
  assert.equal($("app").hidden, true, "ohne gueltigen Schluessel keine Oberflaeche");
});

test("Mit dem richtigen Schlüssel erscheinen Einsätze, Kategorien und Kennzahlen", async () => {
  $("login-key").value = KEY;
  $("login-form").dispatchEvent(new win.Event("submit"));
  await settle(10);

  assert.equal($("app").hidden, false);
  assert.equal($("login").hidden, true);

  assert.equal($("post-list").children.length, 1);
  assert.match($("post-list").textContent, /Vorhandener Einsatz/);

  // Fahrzeuge und Organisationen stehen als Gruppen da, Einsatzarten mit Art-Auswahl.
  const groups = $("category-groups").textContent;
  for (const label of ["Einsatz- und Tätigkeitsarten", "Fahrzeuge", "Weitere Organisationen"]) {
    assert.match(groups, new RegExp(label));
  }
  assert.ok($("category-groups").querySelector("select.kind"), "Einsatzarten brauchen die Art-Auswahl");

  assert.match($("settings-form").textContent, /Mitglieder/);
});

test("Ein neuer Einsatz lässt sich vollständig anlegen", async () => {
  $("new-post").click();
  await settle();

  assert.equal($("post-editor").hidden, false);
  assert.equal($("post-editor-title").textContent, "Neuer Einsatz");

  const categories = await (await api("/categories?per_page=100")).json();
  const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  $("f-title").value = "Verkehrsunfall auf der B73";
  $("f-excerpt").value = "PKW von der Fahrbahn abgekommen";
  $("f-date").value = "2026-09-08T18:42";
  $("f-content").value = "Erster Absatz.\n\nZweiter Absatz.";
  $("f-type").value = String(bySlug.brandeinsatz.id);

  // Fahrzeug und Organisation anhaken wie ein Klick auf den Chip.
  for (const container of ["f-vehicles", "f-organisations"]) {
    const chip = $(container).querySelector(".chip input");
    chip.checked = true;
    chip.dispatchEvent(new win.Event("change"));
  }

  // Erstes Bild als Titelbild waehlen.
  $("f-featured").querySelectorAll("button")[1].click();
  await settle();

  $("save-post").click();
  await settle(12);

  const posts = await (await api("/posts?per_page=100&status=any")).json();
  const saved = posts.find((p) => p.title.rendered === "Verkehrsunfall auf der B73");
  assert.ok(saved, "Der Einsatz muss gespeichert worden sein");

  assert.equal(saved.excerpt.rendered, "PKW von der Fahrbahn abgekommen");
  assert.equal(saved.date, "2026-09-08T18:42:00", "Uhrzeit darf sich nicht verschieben");
  assert.equal(saved.status, "publish");
  assert.notEqual(saved.featured_media, 0, "Titelbild muss gesetzt sein");

  // Ohne die Elternkategorie "einsatze" findet die Startseite den Beitrag nicht.
  assert.ok(saved.categories.includes(bySlug.einsatze.id), "Elternkategorie fehlt");
  assert.ok(saved.categories.includes(bySlug.brandeinsatz.id), "Einsatzart fehlt");
  assert.ok(saved.categories.includes(bySlug.tlfa.id), "Fahrzeug fehlt");
  assert.ok(saved.categories.includes(bySlug["rotes-kreuz"].id), "Organisation fehlt");

  // Der Text muss als Absaetze gespeichert sein, so liest ihn das Frontend.
  assert.match(saved.content.rendered, /<p>Erster Absatz\.<\/p>/);
  assert.match(saved.content.rendered, /<p>Zweiter Absatz\.<\/p>/);

  // Und die Liste zeigt ihn jetzt auch an.
  assert.match($("post-list").textContent, /Verkehrsunfall auf der B73/);
});

test("Ein bestehender Einsatz lässt sich öffnen, ändern und wieder speichern", async () => {
  const entry = [...$("post-list").children].find((li) => li.textContent.includes("Verkehrsunfall"));
  entry.click();
  await settle();

  assert.equal($("f-title").value, "Verkehrsunfall auf der B73");
  assert.equal($("f-date").value, "2026-09-08T18:42", "Datum muss unveraendert zurueckkommen");
  assert.equal($("f-content").value, "Erster Absatz.\n\nZweiter Absatz.", "Text muss verlustfrei zurueckkommen");
  assert.equal($("delete-post").hidden, false);

  $("f-title").value = "Verkehrsunfall B73 (korrigiert)";
  $("f-status").value = "draft";
  $("save-post").click();
  await settle(12);

  const posts = await (await api("/posts?per_page=100&status=any")).json();
  const updated = posts.find((p) => p.title.rendered === "Verkehrsunfall B73 (korrigiert)");
  assert.ok(updated);
  assert.equal(updated.status, "draft");
  assert.equal(updated.excerpt.rendered, "PKW von der Fahrbahn abgekommen", "übrige Felder bleiben erhalten");

  // Als Entwurf darf er nicht mehr oeffentlich sein.
  const oeffentlich = await (await api("/posts?per_page=100")).json();
  assert.ok(!oeffentlich.some((p) => p.id === updated.id));
});

test("Eine neue Einsatzart lässt sich mit Art „Tätigkeit“ anlegen", async () => {
  const group = $("category-groups").querySelector(".group");
  const newRow = group.querySelector(".cat-row.new");
  const [name, description] = newRow.querySelectorAll("input");
  name.value = "Fehlalarm";
  description.value = "Blinder Alarm ohne Schaden";
  newRow.querySelector("select.kind").value = "taetigkeit";
  newRow.querySelector("button").click();
  await settle(12);

  const categories = await (await api("/categories?per_page=100")).json();
  const created = categories.find((c) => c.name === "Fehlalarm");
  assert.ok(created, "Kategorie muss angelegt sein");
  assert.equal(created.meta.kind, "taetigkeit");
  assert.equal(created.slug, "fehlalarm");

  // Und sie steht sofort als Auswahl im Editor bereit.
  $("new-post").click();
  await settle();
  assert.match($("f-type").textContent, /Fehlalarm/);
});

test("Kennzahlen lassen sich speichern, die Einsatzzahl bleibt berechnet", async () => {
  const inputs = $("settings-form").querySelectorAll("input");
  inputs[0].value = "111";
  $("settings-form").querySelector("button").click();
  await settle(12);

  const settings = await (await api("/settings")).json();
  assert.equal(settings["stats.members"], "111");

  // Der berechnete Wert steht als Text da, nicht als Eingabefeld.
  assert.ok($("settings-form").querySelector(".computed"), "berechnete Zahl muss angezeigt werden");
  assert.equal(
    $("settings-form").querySelector(".computed").textContent,
    settings["stats.operationsThisYear"]
  );
});

test("Ein Einsatz lässt sich löschen", async () => {
  const before = (await (await api("/posts?per_page=100&status=any")).json()).length;

  const entry = [...$("post-list").children].find((li) => li.textContent.includes("Vorhandener Einsatz"));
  entry.click();
  await settle();
  $("delete-post").click();
  await settle(12);

  const after = await (await api("/posts?per_page=100&status=any")).json();
  assert.equal(after.length, before - 1);
  assert.ok(!after.some((p) => p.title.rendered === "Vorhandener Einsatz"));
  assert.equal($("post-editor").hidden, true, "Editor schliesst nach dem Loeschen");
});
