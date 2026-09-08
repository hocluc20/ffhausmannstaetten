/**
 * Uebernimmt Kategorien, Beitraege und Beitragsbilder aus der bestehenden
 * WordPress-Installation in diese Datenbank.
 *
 *   node src/import-wp.js
 *   node src/import-wp.js --source http://ff-hausmann.bplaced.net/index.php/wp-json/wp/v2 --reset
 *   node src/import-wp.js --no-images     (nur Metadaten, Bilder bleiben verlinkt)
 *
 * IDs werden uebernommen, damit bestehende Links auf Beitraege gueltig bleiben.
 * Bilder werden standardmaessig heruntergeladen, damit die Seite auch dann
 * funktioniert, wenn die alte Installation abgeschaltet wird.
 */
const fs = require("fs");
const path = require("path");
const { db, UPLOAD_DIR } = require("./db");
const repo = require("./repository");

const arg = (name, fallback) => {
  const index = process.argv.indexOf(`--${name}`);
  return index !== -1 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
};

const SOURCE = (arg("source", process.env.FF_IMPORT_SOURCE ||
  "http://ff-hausmann.bplaced.net/index.php/wp-json/wp/v2")).replace(/\/+$/, "");
const RESET = process.argv.includes("--reset");
const DOWNLOAD_IMAGES = !process.argv.includes("--no-images");

const getJson = async (url) => {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`GET ${url} -> HTTP ${response.status}`);
  return response.json();
};

/** Holt alle Seiten einer Collection, WordPress liefert maximal 100 pro Seite. */
const getAll = async (resource) => {
  const items = [];
  for (let page = 1; page <= 50; page += 1) {
    const batch = await getJson(`${SOURCE}/${resource}${resource.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    items.push(...batch);
    if (batch.length < 100) break;
  }
  return items;
};

const insertCategory = db.prepare(
  "INSERT OR REPLACE INTO categories (id, name, slug, parent, description) VALUES (?, ?, ?, ?, ?)"
);
const insertMedia = db.prepare(
  "INSERT OR REPLACE INTO media (id, filename, mime_type, source_url, alt_text) VALUES (?, ?, ?, ?, ?)"
);
const insertPost = db.prepare(`
  INSERT OR REPLACE INTO posts (id, slug, title, excerpt, content, date, modified, status, featured_media)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const linkCategory = db.prepare(
  "INSERT OR IGNORE INTO post_categories (post_id, category_id) VALUES (?, ?)"
);

const downloadImage = async (url, id) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const ext = path.extname(new URL(url).pathname) || ".jpg";
    const filename = `wp-${id}${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), Buffer.from(await response.arrayBuffer()));
    return filename;
  } catch (error) {
    console.warn(`  Bild ${url} konnte nicht geladen werden (${error.message}) - bleibt verlinkt.`);
    return undefined;
  }
};

const run = async () => {
  console.log(`Import von ${SOURCE}`);
  if (RESET) {
    db.exec("DELETE FROM post_categories; DELETE FROM posts; DELETE FROM media; DELETE FROM categories;");
    console.log("Bestehende Daten geloescht.");
  }

  const categories = await getAll("categories");
  db.transaction(() => {
    for (const c of categories) {
      insertCategory.run(c.id, c.name ?? "", c.slug, c.parent ?? 0, c.description ?? "");
    }
  })();
  console.log(`Kategorien: ${categories.length}`);

  const posts = await getAll("posts?_embed=1");
  console.log(`Beitraege: ${posts.length}`);

  // Bilder zuerst: ein Beitrag verweist per featured_media auf einen Medien-Datensatz.
  const mediaRows = [];
  for (const post of posts) {
    const media = post?._embedded?.["wp:featuredmedia"]?.[0];
    if (!media || media.code || !media.id) continue;
    const remoteUrl =
      media.media_details?.sizes?.large?.source_url ??
      media.source_url ??
      media.guid?.rendered;
    if (!remoteUrl) continue;

    const filename = DOWNLOAD_IMAGES ? await downloadImage(remoteUrl, media.id) : undefined;
    mediaRows.push([
      media.id,
      filename ?? path.basename(remoteUrl),
      media.mime_type ?? "image/jpeg",
      filename ? `/uploads/${filename}` : remoteUrl,
      media.alt_text ?? "",
    ]);
  }
  db.transaction(() => { for (const row of mediaRows) insertMedia.run(...row); })();
  console.log(`Medien: ${mediaRows.length}${DOWNLOAD_IMAGES ? " (heruntergeladen)" : " (verlinkt)"}`);

  const knownMedia = new Set(mediaRows.map(([id]) => id));
  const knownCategories = new Set(categories.map((c) => c.id));

  db.transaction(() => {
    for (const post of posts) {
      insertPost.run(
        post.id,
        post.slug || repo.slugify(post.title?.rendered || `beitrag-${post.id}`),
        post.title?.rendered ?? "",
        post.excerpt?.rendered ?? "",
        post.content?.rendered ?? "",
        (post.date || "").slice(0, 19),
        (post.modified || post.date || "").slice(0, 19),
        post.status || "publish",
        knownMedia.has(post.featured_media) ? post.featured_media : 0
      );
      db.prepare("DELETE FROM post_categories WHERE post_id = ?").run(post.id);
      for (const categoryId of post.categories ?? []) {
        // Verwaiste Zuordnungen wuerden am Fremdschluessel scheitern.
        if (knownCategories.has(categoryId)) linkCategory.run(post.id, categoryId);
      }
    }
  })();

  console.log(
    `Fertig: ${repo.listCategories({ perPage: 1 }).total} Kategorien, ` +
    `${repo.listPosts({ perPage: 1 }).total} Beitraege, ` +
    `${repo.listMedia({ perPage: 1 }).total} Medien in der Datenbank.`
  );
};

run().catch((error) => {
  console.error(`Import fehlgeschlagen: ${error.message}`);
  console.error("Ist die Quelle erreichbar? Pfad pruefen mit --source <URL>.");
  process.exit(1);
});
