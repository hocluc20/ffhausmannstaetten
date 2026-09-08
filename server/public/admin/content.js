/**
 * Umwandlung zwischen Beitragstext und gespeichertem HTML.
 *
 * Liegt bewusst in einer eigenen Datei: das ist der Teil der Redaktions-
 * oberflaeche, der Inhalte zerstoeren kann, und laesst sich so mit
 * "npm test" pruefen. Im Browser haengen die Funktionen an window, in Node
 * kommen sie ueber module.exports.
 */
(function (root) {
  "use strict";

  const escapeHtml = (value) =>
    String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /**
   * HTML-Entities aufloesen. Im Browser uebernimmt das der Parser, in Node
   * reichen die Entities, die WordPress und dieses Backend erzeugen.
   */
  const decodeEntities = (value) => {
    if (typeof document !== "undefined") {
      const area = document.createElement("textarea");
      area.innerHTML = value;
      return area.value;
    }
    return String(value)
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;|&apos;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&");
  };

  /** Upload-URLs relativ speichern, damit die Inhalte hostunabhaengig bleiben. */
  const toRelative = (url, origin) => {
    const base = origin ?? (typeof location !== "undefined" ? location.origin : "");
    return base && String(url).startsWith(base) ? String(url).slice(base.length) : String(url);
  };

  /**
   * Zerlegt gespeichertes HTML in Absaetze und Bilder.
   *
   * `simple` sagt, ob sich der Inhalt aus Absaetzen und Bildern verlustfrei
   * wieder zusammensetzen laesst. Importierte WordPress-Beitraege enthalten oft
   * Ueberschriften, Listen oder Galerie-Markup - die wuerde der Absatzeditor
   * beim Speichern wegwerfen. Solche Beitraege werden als HTML bearbeitet.
   */
  const parseContent = (html) => {
    const source = String(html ?? "");
    const paragraphs = [];
    const photos = [];

    const paragraphPattern = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let match;
    while ((match = paragraphPattern.exec(source)) !== null) {
      const text = decodeEntities(
        match[1].replace(/<br\s*\/?>/gi, "\n").replace(/<\/?(strong|b|em|i)>/gi, "")
      ).trim();
      if (text) paragraphs.push(text);
    }

    const imagePattern = /<img[^>]+src=["']([^"']+)["']/gi;
    while ((match = imagePattern.exec(source)) !== null) photos.push(match[1]);

    // Was bleibt uebrig, wenn man Absaetze, Bilder und deren Huellen entfernt?
    const remainder = source
      .replace(paragraphPattern, "")
      .replace(/<figure[^>]*>|<\/figure>/gi, "")
      .replace(/<figcaption[\s\S]*?<\/figcaption>/gi, "!")
      .replace(/<img[^>]*>/gi, "")
      .replace(/<br\s*\/?>/gi, "")
      .replace(/&nbsp;/gi, " ")
      .trim();

    return { paragraphs, photos, simple: remainder === "" };
  };

  /** Absaetze und ausgewaehlte Fotos zu dem HTML zusammensetzen, das das Frontend erwartet. */
  const buildContent = (text, photoUrls, origin) => {
    const blocks = String(text ?? "")
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`);

    const figures = (photoUrls ?? []).map(
      (url) => `<figure><img src="${escapeHtml(toRelative(url, origin))}" alt="" /></figure>`
    );

    return [...blocks, ...figures].join("\n");
  };

  const api = { escapeHtml, decodeEntities, toRelative, parseContent, buildContent };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.FFContent = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
