/**
 * Datenbank-Layer.
 *
 * SQLite reicht fuer diese Seite voellig aus: die Datenmenge ist klein, es gibt
 * genau einen Schreiber (die Redaktion) und beliebig viele Leser. Die Datei
 * liegt unter data/ und laesst sich per Kopie sichern.
 */
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DATA_DIR = process.env.FF_DATA_DIR || path.join(__dirname, "..", "data");
const DB_FILE = process.env.FF_DB_FILE || path.join(DATA_DIR, "ffhausmannstaetten.sqlite");
const UPLOAD_DIR = process.env.FF_UPLOAD_DIR || path.join(DATA_DIR, "uploads");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = new Database(DB_FILE);

// WAL: Leser blockieren den Schreiber nicht und umgekehrt.
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id          INTEGER PRIMARY KEY,
    name        TEXT    NOT NULL,
    slug        TEXT    NOT NULL UNIQUE,
    parent      INTEGER NOT NULL DEFAULT 0,
    description TEXT    NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS media (
    id         INTEGER PRIMARY KEY,
    filename   TEXT    NOT NULL,
    mime_type  TEXT    NOT NULL DEFAULT 'image/jpeg',
    source_url TEXT    NOT NULL,
    alt_text   TEXT    NOT NULL DEFAULT '',
    created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now'))
  );

  CREATE TABLE IF NOT EXISTS posts (
    id             INTEGER PRIMARY KEY,
    slug           TEXT    NOT NULL UNIQUE,
    title          TEXT    NOT NULL,
    excerpt        TEXT    NOT NULL DEFAULT '',
    content        TEXT    NOT NULL DEFAULT '',
    date           TEXT    NOT NULL,
    modified       TEXT    NOT NULL,
    status         TEXT    NOT NULL DEFAULT 'publish',
    featured_media INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS post_categories (
    post_id     INTEGER NOT NULL REFERENCES posts(id)      ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now'))
  );

  /**
   * Mannschaft. Die Gruppe (Kommando, Zugskommandanten ...) ist frei
   * waehlbarer Text: die Wehr soll Gruppen anlegen koennen, ohne dass jemand
   * das Schema anfasst. sort_order bestimmt die Reihenfolge innerhalb der
   * Gruppe, portrait_media zeigt auf einen Eintrag in media.
   */
  CREATE TABLE IF NOT EXISTS members (
    id             INTEGER PRIMARY KEY,
    name           TEXT    NOT NULL,
    rank           TEXT    NOT NULL DEFAULT '',
    function       TEXT    NOT NULL DEFAULT '',
    team           TEXT    NOT NULL DEFAULT 'Mannschaft',
    sort_order     INTEGER NOT NULL DEFAULT 0,
    portrait_media INTEGER NOT NULL DEFAULT 0,
    active         INTEGER NOT NULL DEFAULT 1
  );

  /**
   * Fuhrpark mit den Angaben der Detailseite.
   *
   * category_id verweist optional auf die gleichnamige Kategorie unter
   * "fahrzeuge" - darueber werden Einsaetze mit Fahrzeugen verknuepft.
   * specs, tasks und photos liegen als JSON, weil sie reine Anzeigelisten
   * sind und nie einzeln abgefragt werden.
   */
  CREATE TABLE IF NOT EXISTS vehicles (
    id          INTEGER PRIMARY KEY,
    slug        TEXT    NOT NULL UNIQUE,
    short       TEXT    NOT NULL,
    name        TEXT    NOT NULL DEFAULT '',
    call_sign   TEXT    NOT NULL DEFAULT '',
    description TEXT    NOT NULL DEFAULT '',
    specs       TEXT    NOT NULL DEFAULT '[]',
    tasks       TEXT    NOT NULL DEFAULT '[]',
    photos      TEXT    NOT NULL DEFAULT '[]',
    category_id INTEGER NOT NULL DEFAULT 0,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    active      INTEGER NOT NULL DEFAULT 1
  );

  CREATE INDEX IF NOT EXISTS idx_members_team     ON members(team, sort_order);
  CREATE INDEX IF NOT EXISTS idx_vehicles_order   ON vehicles(sort_order);
  CREATE INDEX IF NOT EXISTS idx_posts_date        ON posts(date DESC);
  CREATE INDEX IF NOT EXISTS idx_postcat_category  ON post_categories(category_id);
  CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent);
`);

/**
 * Nachtraegliche Schemaerweiterungen.
 *
 * Bestehende Installationen sollen sich beim Start selbst aktualisieren,
 * ohne dass jemand ein Migrationswerkzeug bedienen muss.
 */
const addColumn = (table, column, definition) => {
  const exists = db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === column);
  if (!exists) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
};

/**
 * Unterscheidet Einsatzarten von Taetigkeitsarten.
 *
 * Beides haengt unter "einsatze", die Seite muss aber beides auseinander
 * halten koennen: die Jahreszahl auf der Startseite zaehlt ausschliesslich
 * echte Einsaetze, nicht Uebungen oder Ortsfeste.
 */
addColumn("categories", "kind", "TEXT NOT NULL DEFAULT 'einsatz'");

/**
 * Ordner fuer die Mediathek.
 *
 * Bewusst ein einfaches Textfeld statt einer Ordnertabelle: Ordner sind hier
 * reine Sortierhilfe, es gibt keine Rechte und keine Verschachtelung. Ein
 * leerer Wert heisst "noch nicht einsortiert".
 */
addColumn("media", "folder", "TEXT NOT NULL DEFAULT ''");

db.exec("CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder, id DESC);");

module.exports = { db, DATA_DIR, DB_FILE, UPLOAD_DIR };
