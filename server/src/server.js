/**
 * HTTP-Schnittstelle.
 *
 * Lesen ist oeffentlich und WordPress-kompatibel, Schreiben verlangt den
 * API-Key aus FF_API_KEY (Header X-API-Key). Damit kann die Redaktion
 * Einsaetze pflegen, ohne dass WordPress noch im Spiel ist.
 */
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");

const { DATA_DIR, UPLOAD_DIR } = require("./db");
const repo = require("./repository");
const { categoryToWp, mediaToWp, postToWp, memberToJson, vehicleToJson } = require("./wp");

const PORT = Number(process.env.PORT || 4000);
const ADMIN_DIR = path.join(__dirname, "..", "public", "admin");

/**
 * Schluessel fuer Schreibzugriffe.
 *
 * Ohne FF_API_KEY wird beim ersten Start einer erzeugt und in
 * data/api-key.txt abgelegt - sonst waere die Adminoberflaeche direkt nach
 * dem Auschecken unbenutzbar. FF_API_KEY=off schaltet Schreibzugriffe
 * vollstaendig ab, z. B. fuer eine rein lesende Zweitinstanz.
 */
const resolveApiKey = () => {
  const configured = process.env.FF_API_KEY;
  if (configured === "off") return "";
  if (configured) return configured;

  const keyFile = path.join(DATA_DIR, "api-key.txt");
  if (fs.existsSync(keyFile)) {
    const stored = fs.readFileSync(keyFile, "utf8").trim();
    if (stored) return stored;
  }
  const generated = crypto.randomBytes(24).toString("hex");
  fs.writeFileSync(keyFile, `${generated}\n`, { mode: 0o600 });
  return generated;
};

const API_KEY = resolveApiKey();

const app = express();
app.disable("x-powered-by");

app.use(cors({
  origin: process.env.FF_CORS_ORIGIN || "*",
  // Ohne exposedHeaders kommen die Paginierungs-Header im Browser nicht an.
  exposedHeaders: ["X-WP-Total", "X-WP-TotalPages"],
}));
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "7d" }));

/* --------------------------------------------------------------- Hilfsmittel */

const intParam = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const idList = (value) =>
  String(value ?? "")
    .split(",")
    .map((part) => Number.parseInt(part, 10))
    .filter(Number.isFinite);

const paginate = (res, total, perPage) => {
  res.set("X-WP-Total", String(total));
  res.set("X-WP-TotalPages", String(Math.max(1, Math.ceil(total / perPage))));
};

const notFound = (res, what) =>
  res.status(404).json({ code: "rest_not_found", message: `${what} wurde nicht gefunden.`, data: { status: 404 } });

/** Schreibzugriff nur mit gueltigem Key; mit FF_API_KEY=off ist er komplett zu. */
const requireKey = (req, res, next) => {
  if (!API_KEY) {
    return res.status(503).json({
      code: "rest_write_disabled",
      message: "Schreibzugriff ist auf dieser Instanz deaktiviert (FF_API_KEY=off).",
      data: { status: 503 },
    });
  }
  const provided = req.get("X-API-Key") || (req.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const ok =
    provided.length === API_KEY.length &&
    crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(API_KEY));
  if (!ok) {
    return res.status(401).json({ code: "rest_forbidden", message: "Ungueltiger API-Key.", data: { status: 401 } });
  }
  return next();
};

const api = express.Router();

/** Die Adminoberflaeche prueft damit, ob der eingegebene Schluessel stimmt. */
api.get("/session", requireKey, (req, res) => {
  res.json({ ok: true, writeEnabled: true });
});

/* --------------------------------------------------------------- Kategorien */

api.get("/categories", (req, res) => {
  const perPage = Math.min(intParam(req.query.per_page, 10), 100);
  const page = intParam(req.query.page, 1);
  const { rows, total } = repo.listCategories({
    perPage,
    page,
    parent: req.query.parent !== undefined ? intParam(req.query.parent, 0) : undefined,
    slug: req.query.slug,
  });
  paginate(res, total, perPage);
  res.json(rows.map((row) => categoryToWp(row, req)));
});

api.get("/categories/:id", (req, res) => {
  const row = repo.getCategory(intParam(req.params.id, 0));
  return row ? res.json(categoryToWp(row, req)) : notFound(res, "Die Kategorie");
});

api.post("/categories", requireKey, (req, res) => {
  if (!req.body || !req.body.name) {
    return res.status(400).json({ code: "rest_missing_param", message: "name fehlt." });
  }
  res.status(201).json(categoryToWp(repo.createCategory(req.body), req));
});

api.patch("/categories/:id", requireKey, (req, res) => {
  const row = repo.updateCategory(intParam(req.params.id, 0), req.body ?? {});
  return row ? res.json(categoryToWp(row, req)) : notFound(res, "Die Kategorie");
});

api.delete("/categories/:id", requireKey, (req, res) => {
  const id = intParam(req.params.id, 0);
  const row = repo.getCategory(id);
  if (!row) return notFound(res, "Die Kategorie");

  // Eine Elternkategorie zu loeschen wuerde ihre Kinder verwaisen lassen:
  // "fahrzeuge" weg heisst, dass das Frontend keine Fahrzeuge mehr findet.
  const children = repo.listCategories({ parent: id, perPage: 1 }).total;
  if (children > 0) {
    return res.status(409).json({
      code: "rest_has_children",
      message: `"${row.name}" hat noch ${children} Unterkategorie(n). Diese zuerst loeschen oder umhaengen.`,
      data: { status: 409, children },
    });
  }

  repo.deleteCategory(id);
  res.json({ deleted: true, previous: categoryToWp(row, req) });
});

/* ---------------------------------------------------------------- Beitraege */

api.get("/posts", (req, res) => {
  const perPage = Math.min(intParam(req.query.per_page, 10), 100);
  const page = intParam(req.query.page, 1);
  const { items, total } = repo.listPosts({
    perPage,
    page,
    categories: idList(req.query.categories),
    search: req.query.search,
    order: req.query.order,
    // "any" wird durchgereicht, damit die Redaktion auch Entwuerfe sieht.
    status: req.query.status || "publish",
  });
  // _embed spart dem Frontend einen Request pro Beitragsbild.
  const embed = req.query._embed !== undefined && req.query._embed !== "0";
  paginate(res, total, perPage);
  res.json(items.map(({ row, categories, media }) =>
    postToWp(row, req, { categories, media: embed ? media : undefined })
  ));
});

api.get("/posts/:id", (req, res) => {
  const found = repo.getPost(intParam(req.params.id, 0));
  if (!found) return notFound(res, "Der Beitrag");
  const embed = req.query._embed !== undefined && req.query._embed !== "0";
  res.json(postToWp(found.row, req, { categories: found.categories, media: embed ? found.media : undefined }));
});

api.post("/posts", requireKey, (req, res) => {
  if (!req.body || !req.body.title) {
    return res.status(400).json({ code: "rest_missing_param", message: "title fehlt." });
  }
  const created = repo.createPost(req.body);
  res.status(201).json(postToWp(created.row, req, { categories: created.categories, media: created.media }));
});

api.patch("/posts/:id", requireKey, (req, res) => {
  const updated = repo.updatePost(intParam(req.params.id, 0), req.body ?? {});
  if (!updated) return notFound(res, "Der Beitrag");
  res.json(postToWp(updated.row, req, { categories: updated.categories, media: updated.media }));
});

api.delete("/posts/:id", requireKey, (req, res) => {
  const id = intParam(req.params.id, 0);
  const found = repo.getPost(id);
  if (!found) return notFound(res, "Der Beitrag");
  repo.deletePost(id);
  res.json({ deleted: true, previous: postToWp(found.row, req, { categories: found.categories }) });
});

/* ---------------------------------------------------------------- Mannschaft */

api.get("/members", (req, res) => {
  // Die Redaktion sieht mit ?include_inactive=1 auch ausgetretene Mitglieder.
  const includeInactive = req.query.include_inactive === "1";
  const rows = repo.listMembers({ includeInactive });
  res.json(rows.map((row) => memberToJson(row, req, row.portrait_media ? repo.getMedia(row.portrait_media) : undefined)));
});

api.post("/members", requireKey, (req, res) => {
  if (!req.body || !req.body.name) {
    return res.status(400).json({ code: "rest_missing_param", message: "name fehlt." });
  }
  const row = repo.createMember(req.body);
  res.status(201).json(memberToJson(row, req, repo.getMedia(row.portrait_media)));
});

api.patch("/members/:id", requireKey, (req, res) => {
  const row = repo.updateMember(intParam(req.params.id, 0), req.body ?? {});
  if (!row) return notFound(res, "Das Mitglied");
  res.json(memberToJson(row, req, repo.getMedia(row.portrait_media)));
});

api.delete("/members/:id", requireKey, (req, res) => {
  const id = intParam(req.params.id, 0);
  const row = repo.getMember(id);
  if (!row) return notFound(res, "Das Mitglied");
  repo.deleteMember(id);
  res.json({ deleted: true, previous: memberToJson(row, req) });
});

/* ------------------------------------------------------------------ Fuhrpark */

api.get("/vehicles", (req, res) => {
  const includeInactive = req.query.include_inactive === "1";
  res.json(repo.listVehicles({ includeInactive }).map((vehicle) => vehicleToJson(vehicle, req)));
});

api.get("/vehicles/:idOrSlug", (req, res) => {
  const raw = String(req.params.idOrSlug);
  // Die Detailseite ruft /vehicles/tlfa auf, die Redaktion /vehicles/3.
  const vehicle = /^\d+$/.test(raw) ? repo.getVehicle(Number(raw)) : repo.getVehicleBySlug(raw);
  return vehicle ? res.json(vehicleToJson(vehicle, req)) : notFound(res, "Das Fahrzeug");
});

api.post("/vehicles", requireKey, (req, res) => {
  if (!req.body || !req.body.short) {
    return res.status(400).json({ code: "rest_missing_param", message: "short (Kurzname) fehlt." });
  }
  res.status(201).json(vehicleToJson(repo.createVehicle(req.body), req));
});

api.patch("/vehicles/:id", requireKey, (req, res) => {
  const vehicle = repo.updateVehicle(intParam(req.params.id, 0), req.body ?? {});
  if (!vehicle) return notFound(res, "Das Fahrzeug");
  res.json(vehicleToJson(vehicle, req));
});

api.delete("/vehicles/:id", requireKey, (req, res) => {
  const id = intParam(req.params.id, 0);
  const vehicle = repo.getVehicle(id);
  if (!vehicle) return notFound(res, "Das Fahrzeug");
  repo.deleteVehicle(id);
  res.json({ deleted: true, previous: vehicleToJson(vehicle, req) });
});

/* ------------------------------------------------------------ Einstellungen */

/**
 * Kennzahlen der Startseite.
 *
 * `stats.operationsThisYear` wird berechnet und nicht gespeichert: die Zahl
 * der Einsaetze soll sich aus den erfassten Einsaetzen ergeben und nicht von
 * Hand gepflegt werden. Sie ist deshalb auch per PATCH nicht setzbar.
 */
const COMPUTED_SETTINGS = new Set(["stats.operationsThisYear", "stats.year"]);

const settingsPayload = () => {
  const year = new Date().getFullYear();
  return {
    ...repo.listSettings(),
    "stats.year": String(year),
    "stats.operationsThisYear": String(repo.countOperations(year)),
  };
};

api.get("/settings", (req, res) => {
  res.json(settingsPayload());
});

api.patch("/settings", requireKey, (req, res) => {
  const body = req.body ?? {};
  const rejected = Object.keys(body).filter((key) => COMPUTED_SETTINGS.has(key));
  if (rejected.length) {
    return res.status(400).json({
      code: "rest_readonly_setting",
      message: `${rejected.join(", ")} wird aus den erfassten Einsaetzen berechnet und kann nicht gesetzt werden.`,
      data: { status: 400, rejected },
    });
  }
  const writable = Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== null && value !== undefined)
  );
  repo.setSettings(writable);
  res.json(settingsPayload());
});

/* ------------------------------------------------------------------- Medien */

api.get("/media", (req, res) => {
  const perPage = Math.min(intParam(req.query.per_page, 10), 100);
  const page = intParam(req.query.page, 1);
  // ?folder=Fahrzeuge grenzt ein, ?folder= (leer) zeigt die unsortierten.
  const folder = req.query.folder;
  const { rows, total } = repo.listMedia({ perPage, page, folder });
  paginate(res, total, perPage);
  res.json(rows.map((row) => mediaToWp(row, req)));
});

api.get("/media-folders", (req, res) => {
  res.json(repo.listMediaFolders());
});

/** Ordner umbenennen oder zusammenlegen. */
api.patch("/media-folders", requireKey, (req, res) => {
  const { from, to } = req.body ?? {};
  if (from === undefined || to === undefined) {
    return res.status(400).json({ code: "rest_missing_param", message: "from und to fehlen." });
  }
  const moved = repo.renameMediaFolder(from, to);
  res.json({ moved, folders: repo.listMediaFolders() });
});

api.get("/media/:id", (req, res) => {
  const row = repo.getMedia(intParam(req.params.id, 0));
  return row ? res.json(mediaToWp(row, req)) : notFound(res, "Das Medium");
});

/**
 * Zwei Wege, ein Bild anzulegen:
 *   JSON   {"source_url": "...", "filename": "..."}   -> nur verlinken
 *   Binaer (Content-Type: image/*, Header X-Filename) -> Datei landet in data/uploads
 */
const rawBody = express.raw({
  type: (req) => !/json/i.test(req.get("content-type") || ""),
  limit: "25mb",
});

api.post("/media", requireKey, rawBody, (req, res) => {
  if (Buffer.isBuffer(req.body) && req.body.length > 0) {
    const mimeType = req.get("content-type") || "application/octet-stream";
    const fallbackExt = (mimeType.split("/")[1] || "bin").replace(/[^a-z0-9]/gi, "");
    // Header duerfen nur Latin-1 enthalten, "Übung.jpg" kommt daher
    // prozentkodiert an (so schickt es auch die Adminoberflaeche).
    const sent = req.get("X-Filename");
    let original = sent || `upload.${fallbackExt}`;
    try {
      if (sent) original = decodeURIComponent(sent);
    } catch {
      // Kein gueltiges Prozent-Encoding: den Rohwert verwenden.
    }
    const ext = path.extname(original) || "";
    const filename = `${Date.now()}-${repo.slugify(path.basename(original, ext))}${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), req.body);
    // Der Ordner kommt als Header, weil der Rumpf die Bilddaten traegt.
    let folder = req.get("X-Folder") || "";
    try {
      folder = decodeURIComponent(folder);
    } catch {
      // Kein gueltiges Prozent-Encoding: Rohwert verwenden.
    }
    const row = repo.createMedia({
      filename,
      mimeType,
      sourceUrl: `/uploads/${filename}`,
      altText: req.get("X-Alt-Text") || "",
      folder,
    });
    return res.status(201).json(mediaToWp(row, req));
  }

  const body = req.body ?? {};
  if (!body.source_url) {
    return res.status(400).json({ code: "rest_missing_param", message: "source_url oder Bilddaten fehlen." });
  }
  const row = repo.createMedia({
    sourceUrl: body.source_url,
    filename: body.filename || path.basename(body.source_url),
    mimeType: body.mime_type || "image/jpeg",
    altText: body.alt_text || "",
    folder: body.folder || "",
  });
  res.status(201).json(mediaToWp(row, req));
});

/** Bild umbenennen (Alternativtext) oder in einen anderen Ordner schieben. */
api.patch("/media/:id", requireKey, (req, res) => {
  const row = repo.updateMedia(intParam(req.params.id, 0), req.body ?? {});
  return row ? res.json(mediaToWp(row, req)) : notFound(res, "Das Medium");
});

api.delete("/media/:id", requireKey, (req, res) => {
  const id = intParam(req.params.id, 0);
  const row = repo.getMedia(id);
  if (!row) return notFound(res, "Das Medium");
  // Nur selbst gespeicherte Dateien loeschen, verlinkte URLs gehoeren uns nicht.
  if (row.source_url.startsWith("/uploads/")) {
    fs.rmSync(path.join(UPLOAD_DIR, path.basename(row.source_url)), { force: true });
  }
  repo.deleteMedia(id);
  res.json({ deleted: true, previous: mediaToWp(row, req) });
});

/* ------------------------------------------------------------------- Mounts */

// Beide Pfade zeigen auf dieselbe API: der WP-Pfad, damit REACT_APP_API_BASE
// unveraendert weiterverwendet werden kann, und der kurze fuer neue Clients.
app.use("/wp-json/wp/v2", api);
app.use("/api/v1", api);

// Redaktionsoberflaeche. FF_ADMIN=off blendet sie aus, wenn die Instanz nur
// ausliefern und nicht bearbeitet werden soll.
if (process.env.FF_ADMIN !== "off") {
  app.use("/admin", express.static(ADMIN_DIR));
}

app.get("/health", (req, res) => {
  const { total: categories } = repo.listCategories({ perPage: 1 });
  const { total: posts } = repo.listPosts({ perPage: 1 });
  res.json({
    status: "ok",
    categories,
    posts,
    members: repo.listMembers({ includeInactive: true }).length,
    vehicles: repo.listVehicles({ includeInactive: true }).length,
    writeEnabled: Boolean(API_KEY),
  });
});

app.use((req, res) => notFound(res, `Die Route ${req.path}`));

// eslint-disable-next-line no-unused-vars -- Express erkennt den Fehlerhandler an der Signatur
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ code: "internal_error", message: "Interner Serverfehler.", data: { status: 500 } });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`FF Hausmannstaetten API laeuft auf http://localhost:${PORT}`);
    console.log(`  WordPress-kompatibel: http://localhost:${PORT}/wp-json/wp/v2`);
    if (process.env.FF_ADMIN !== "off") {
      console.log(`  Redaktion:            http://localhost:${PORT}/admin`);
    }
    if (!API_KEY) {
      console.log("  Schreibzugriff: deaktiviert (FF_API_KEY=off)");
    } else if (process.env.FF_API_KEY) {
      console.log("  Schreibzugriff: aktiv, Schluessel aus FF_API_KEY");
    } else {
      console.log(`  Schluessel fuer die Anmeldung: ${API_KEY}`);
      console.log("  (gespeichert in data/api-key.txt, mit FF_API_KEY ueberschreibbar)");
    }
  });
}

module.exports = app;
