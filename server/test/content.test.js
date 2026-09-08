/**
 * Tests fuer die Text<->HTML-Umwandlung der Redaktionsoberflaeche.
 *
 * Der Absatzeditor ist bequem, aber er kann nur Absaetze und Bilder. Wenn er
 * einen importierten WordPress-Beitrag mit Ueberschriften oder Listen
 * bearbeitet und speichert, waere der Rest weg. Deshalb wird hier vor allem
 * geprueft, dass `simple` genau dann false ist, wenn etwas verloren ginge.
 */
const test = require("node:test");
const assert = require("node:assert/strict");

const { parseContent, buildContent, toRelative } = require("../public/admin/content.js");

test("Absaetze und Fotos ueberstehen den Weg hin und zurueck", () => {
  const text = "Erster Absatz.\n\nZweiter Absatz\nmit Zeilenumbruch.";
  const photos = ["/uploads/eins.jpg", "/uploads/zwei.jpg"];

  const html = buildContent(text, photos, "http://localhost:4000");
  const parsed = parseContent(html);

  assert.ok(parsed.simple);
  assert.deepEqual(parsed.paragraphs, ["Erster Absatz.", "Zweiter Absatz\nmit Zeilenumbruch."]);
  assert.deepEqual(parsed.photos, photos);
  assert.equal(parsed.paragraphs.join("\n\n"), text);
});

test("Das erzeugte HTML passt zu den Filtern des Frontends", () => {
  const html = buildContent("Ein Absatz.", ["/uploads/bild.jpg"], "http://localhost:4000");

  // filterTextFromContent(): /<(p|pre)[^>]*>(.*?)<\/\1>/gs
  const texts = [...html.matchAll(/<(p|pre)[^>]*>(.*?)<\/\1>/gs)].map((m) => m[2]);
  assert.deepEqual(texts, ["Ein Absatz."]);

  // filterPhotosFromContent(): /<img[^>]+src=["']([^"']+)["']/g
  const images = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/g)].map((m) => m[1]);
  assert.deepEqual(images, ["/uploads/bild.jpg"]);
});

test("Absolute Upload-URLs werden relativ gespeichert", () => {
  const html = buildContent("Text.", ["http://localhost:4000/uploads/bild.jpg"], "http://localhost:4000");
  assert.match(html, /<img src="\/uploads\/bild\.jpg"/);

  // Fremde Hosts bleiben unangetastet - die gehoeren uns nicht.
  const fremd = buildContent("Text.", ["https://example.org/foto.jpg"], "http://localhost:4000");
  assert.match(fremd, /<img src="https:\/\/example\.org\/foto\.jpg"/);
  assert.equal(toRelative("https://example.org/foto.jpg", "http://localhost:4000"), "https://example.org/foto.jpg");
});

test("Sonderzeichen im Text werden maskiert und nicht als HTML gespeichert", () => {
  const html = buildContent('Einsatz <B02> & "Übung"', [], "");
  assert.match(html, /<p>Einsatz &lt;B02&gt; &amp; "Übung"<\/p>/);

  // Und beim Zurueckwandeln steht wieder der Originaltext da.
  assert.deepEqual(parseContent(html).paragraphs, ['Einsatz <B02> & "Übung"']);
});

test("Reiner Absatz-Inhalt gilt als einfach", () => {
  const wordpressStil = '<p>Kurz nach 7 Uhr alarmiert.</p>\n<figure class="wp-block-image"><img src="https://alt.example/foto.jpg" alt="" /></figure>';
  const parsed = parseContent(wordpressStil);
  assert.ok(parsed.simple, "Absaetze plus Bild in figure sind darstellbar");
  assert.deepEqual(parsed.photos, ["https://alt.example/foto.jpg"]);
});

test("Inhalt mit Ueberschriften oder Listen gilt NICHT als einfach", () => {
  // Genau dieser Fall zwingt die Oberflaeche in den HTML-Modus, statt beim
  // Speichern die Liste zu verlieren.
  const mitListe = "<p>Vorwort.</p><h2>Ablauf</h2><ul><li>Erkundung</li><li>Loeschangriff</li></ul>";
  assert.equal(parseContent(mitListe).simple, false);

  const mitTabelle = "<p>Text.</p><table><tr><td>Wert</td></tr></table>";
  assert.equal(parseContent(mitTabelle).simple, false);

  const mitLink = '<p>Mehr dazu.</p><a href="https://example.org">Bericht</a>';
  assert.equal(parseContent(mitLink).simple, false);
});

test("Leerer Inhalt ergibt leere Absaetze und bleibt einfach", () => {
  const parsed = parseContent("");
  assert.deepEqual(parsed.paragraphs, []);
  assert.deepEqual(parsed.photos, []);
  assert.ok(parsed.simple);
  assert.equal(buildContent("", [], ""), "");
});

test("Leere Absaetze aus dem Editor werden nicht gespeichert", () => {
  const html = buildContent("Erster.\n\n\n\n   \n\nZweiter.", [], "");
  assert.equal(html, "<p>Erster.</p>\n<p>Zweiter.</p>");
});
