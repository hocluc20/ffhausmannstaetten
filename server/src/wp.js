/**
 * Serialisierung im WordPress-REST-Format.
 *
 * Das Frontend spricht bereits die WP-v2-API (title.rendered, content.rendered,
 * _embedded["wp:featuredmedia"] ...). Dieses Backend bildet genau diese Form
 * nach, damit nur REACT_APP_API_BASE umgestellt werden muss und kein einziger
 * Frontend-Aufruf angefasst werden muss.
 */

/** Macht relative Upload-Pfade zu absoluten URLs, damit <img src> im Browser passt. */
const absoluteUrl = (req, url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = (process.env.FF_PUBLIC_URL || `${req.protocol}://${req.get("host")}`).replace(/\/+$/, "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
};

/** Gespeicherte Ortszeit -> UTC, wie es WordPress in den *_gmt-Feldern liefert. */
const gmt = (stamp) => {
  const local = new Date(`${stamp}Z`);
  if (Number.isNaN(local.getTime())) return String(stamp);
  return new Date(local.getTime() + new Date(stamp).getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 19);
};

/**
 * Bilder im Beitragstext stehen als "/uploads/..." in der Datenbank, damit die
 * Inhalte unabhaengig vom Hostnamen bleiben. Erst beim Ausliefern werden
 * daraus absolute URLs - sonst sucht der Browser die Bilder unter der Domain
 * des Frontends (Port 3000) statt beim Backend.
 */
const withAbsoluteImages = (content, req) =>
  String(content).replace(
    /(<img\b[^>]*?\bsrc=["'])(\/uploads\/[^"']+)(["'])/gi,
    (_match, before, url, after) => `${before}${absoluteUrl(req, url)}${after}`
  );

const categoryToWp = (row, req) => ({
  id: row.id,
  count: row.count ?? 0,
  description: row.description ?? "",
  link: `${absoluteUrl(req, "/")}category/${row.slug}`,
  name: row.name,
  slug: row.slug,
  taxonomy: "category",
  parent: row.parent ?? 0,
  // WordPress liefert hier ein leeres Array; wir nutzen das Feld fuer die
  // Unterscheidung Einsatz/Taetigkeit. Das Frontend liest meta.kind, aeltere
  // Clients ignorieren es einfach.
  meta: { kind: row.kind ?? "einsatz" },
});

const mediaToWp = (row, req) => {
  const url = absoluteUrl(req, row.source_url);
  // Es wird nicht skaliert: alle Groessen zeigen auf dieselbe Datei. Das
  // Frontend probiert large -> medium_large -> source_url und ist damit bedient.
  const size = { source_url: url, mime_type: row.mime_type, width: 0, height: 0 };
  return {
    id: row.id,
    date: row.created_at,
    slug: String(row.filename).replace(/\.[^.]+$/, ""),
    type: "attachment",
    title: { rendered: row.filename },
    alt_text: row.alt_text ?? "",
    // Eigene Erweiterung: Ordner der Mediathek (WordPress kennt das nicht).
    folder: row.folder ?? "",
    media_type: String(row.mime_type).startsWith("image/") ? "image" : "file",
    mime_type: row.mime_type,
    source_url: url,
    guid: { rendered: url },
    media_details: { file: row.filename, sizes: { full: size, large: size, medium_large: size, medium: size } },
  };
};

const postToWp = (row, req, { media, categories } = {}) => {
  const link = `${absoluteUrl(req, "/")}${row.slug}`;
  const post = {
    id: row.id,
    date: row.date,
    date_gmt: gmt(row.date),
    guid: { rendered: link },
    modified: row.modified,
    modified_gmt: gmt(row.modified),
    slug: row.slug,
    status: row.status,
    type: "post",
    link,
    title: { rendered: row.title },
    content: { rendered: withAbsoluteImages(row.content, req), protected: false },
    excerpt: { rendered: row.excerpt, protected: false },
    author: 1,
    featured_media: row.featured_media ?? 0,
    categories: categories ?? [],
    tags: [],
  };

  if (media) {
    post._embedded = { "wp:featuredmedia": [mediaToWp(media, req)] };
  }
  return post;
};

/**
 * Mannschaft und Fuhrpark sind keine WordPress-Typen - hier wird deshalb
 * nicht deren Form nachgebaut, sondern schlicht das ausgeliefert, was die
 * Website braucht. Relative Uploadpfade werden wie ueberall erst beim
 * Ausliefern absolut.
 */
const memberToJson = (row, req, media) => ({
  id: row.id,
  name: row.name,
  rank: row.rank ?? "",
  function: row.function ?? "",
  team: row.team ?? "",
  sort_order: row.sort_order ?? 0,
  active: row.active !== 0,
  portrait_media: row.portrait_media ?? 0,
  portrait_url: media ? absoluteUrl(req, media.source_url) : "",
});

const vehicleToJson = (vehicle, req) => ({
  id: vehicle.id,
  slug: vehicle.slug,
  short: vehicle.short,
  name: vehicle.name ?? "",
  call_sign: vehicle.call_sign ?? "",
  description: vehicle.description ?? "",
  specs: (vehicle.specs ?? []).map((spec) => ({
    label: String(spec?.label ?? ""),
    value: String(spec?.value ?? ""),
  })),
  tasks: (vehicle.tasks ?? []).map((task) => String(task)),
  photos: (vehicle.photos ?? []).map((photo) => ({
    url: absoluteUrl(req, photo?.url ?? ""),
    caption: String(photo?.caption ?? ""),
  })),
  category_id: vehicle.category_id ?? 0,
  sort_order: vehicle.sort_order ?? 0,
  active: vehicle.active !== false,
});

module.exports = { absoluteUrl, categoryToWp, mediaToWp, postToWp, memberToJson, vehicleToJson };
