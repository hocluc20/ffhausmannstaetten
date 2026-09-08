/**
 * Befuellt eine leere Datenbank mit der Kategoriestruktur, die das Frontend
 * erwartet, und mit Beispiel-Einsaetzen.
 *
 * Die Struktur ist nicht frei waehlbar: DataContext sucht die Kategorie mit
 * dem Slug "einsatze", FilterFunctions liest die Einsatzart aus deren
 * Unterkategorien, die Fahrzeuge aus denen von "fahrzeuge" und die weiteren
 * Organisationen aus denen von "einsatzmittel".
 *
 *   node src/seed.js           -> nur befuellen, wenn noch nichts da ist
 *   node src/seed.js --reset   -> alles loeschen und neu aufbauen
 */
const fs = require("fs");
const path = require("path");
const { db, UPLOAD_DIR } = require("./db");
const repo = require("./repository");

const reset = process.argv.includes("--reset");

const TOP_LEVEL = [
  { slug: "einsatze", name: "Einsätze", description: "Alle Einsätze und Tätigkeiten der Feuerwehr Hausmannstätten" },
  { slug: "fahrzeuge", name: "Fahrzeuge", description: "Fahrzeuge des Feuerwehrhauses Hausmannstätten" },
  { slug: "einsatzmittel", name: "Einsatzmittel", description: "Weitere beteiligte Organisationen und Einsatzmittel" },
];

/**
 * `kind` trennt echte Einsaetze von sonstigen Taetigkeiten. Die Jahreszahl
 * auf der Startseite zaehlt nur "einsatz"; die Seite kennzeichnet beides
 * unterschiedlich und laesst danach filtern.
 */
const TYPES = [
  { slug: "brandeinsatz", name: "Brandeinsatz", kind: "einsatz", description: "Brandbekämpfung und Brandsicherheitswachen" },
  { slug: "technischer-einsatz", name: "Technischer Einsatz", kind: "einsatz", description: "Technische Hilfeleistung, Menschenrettung, Fahrzeugbergung" },
  { slug: "schadstoffeinsatz", name: "Schadstoffeinsatz", kind: "einsatz", description: "Austritt gefährlicher Stoffe, Ölspuren" },
  { slug: "uebung", name: "Übung", kind: "taetigkeit", description: "Ausbildung und Übungsdienst" },
  { slug: "taetigkeit", name: "Tätigkeit", kind: "taetigkeit", description: "Sonstige Tätigkeiten im Dienst der Gemeinde" },
];

const VEHICLES = [
  { slug: "tlfa", name: "TLFA", description: "Tanklöschfahrzeug mit Allradantrieb" },
  { slug: "krfs-t", name: "KRFS-T", description: "Kleinrüstfahrzeug mit Seilwinde und Tank" },
  { slug: "mzfa", name: "MZFA", description: "Mehrzweckfahrzeug mit Allradantrieb" },
  { slug: "mtf", name: "MTF", description: "Mannschaftstransportfahrzeug" },
  { slug: "tsa", name: "TSA", description: "Tragkraftspritzenanhänger" },
];

const ORGANISATIONS = [
  { slug: "rotes-kreuz", name: "Rotes Kreuz", description: "Rettungsdienst" },
  { slug: "polizei", name: "Polizei", description: "Landespolizeidirektion Steiermark" },
  { slug: "notarzt", name: "Notarzt", description: "Notarzteinsatzfahrzeug" },
  { slug: "ff-vasoldsberg", name: "FF Vasoldsberg", description: "Freiwillige Feuerwehr Vasoldsberg" },
  { slug: "ff-fernitz", name: "FF Fernitz", description: "Freiwillige Feuerwehr Fernitz" },
  { slug: "drohnenteam", name: "Drohnenteam", description: "Drohnenteam des Bereichsfeuerwehrverbandes" },
];

/**
 * Mannschaft.
 *
 * TODO(Feuerwehr): Das Impressum nennt HBI Daniel Rothdeutsch als
 * Kommandanten, diese Liste HBI Thomas Molidor. Eine der beiden Angaben ist
 * veraltet - bitte pruefen und im Adminbereich korrigieren.
 */
const MEMBERS = [
  ["Kommando", "HBI Thomas Molidor", "Hauptbrandinspektor", "Kommandant"],
  ["Kommando", "OBI Johannes Lafer", "Oberbrandinspektor", "Stv. Kommandant"],

  ["Zugskommandanten", "BI Robert Zaunschirm", "Zugskommandant", "Übungsbeauftragter"],
  ["Zugskommandanten", "HBI a.D. Robert Molidor", "Zugskommandant", "Katastrophenschutzbeauftragter"],
  ["Zugskommandanten", "BM Gernot Lukas", "Zugskommandant", "Kraftfahrerbeauftragter"],

  ["Gruppenkommandanten", "OBI a.D. Thomas Maier-Pongratz", "Gruppenkommandant", "ÖFAST-Beauftragter"],
  ["Gruppenkommandanten", "HLM Roland Helm", "Gruppenkommandant", "MRAS-Beauftragter"],
  ["Gruppenkommandanten", "HLM Robert Matzer", "Gruppenkommandant", ""],
  ["Gruppenkommandanten", "OLM Martin Pechmann", "Gruppenkommandant", "Geräte- und Maschinenmeister"],
  ["Gruppenkommandanten", "LM Lukas Barrett", "Gruppenkommandant", "Geräte- und Maschinenmeister"],
  ["Gruppenkommandanten", "LM Thomas Lechner", "Gruppenkommandant", "Kassier"],

  ["Beauftragte", "LM d.V. Christoph Winkler", "Verwaltungsbeauftragter", "Schriftführer"],
  ["Beauftragte", "LM d.V. Lukas Hochfellner", "Verwaltungsbeauftragter", "EDV-Beauftragter"],
  ["Beauftragte", "LM d.F. Fabian Pußwald", "Fachdienstbeauftragter", "Funkbeauftragter"],
  ["Beauftragte", "OLM d.F. Daniel Laipold", "Fachdienstbeauftragter", "Küchenbeauftragter"],
  ["Beauftragte", "OLM d.F. Clemens Lafer", "Fachdienstbeauftragter", "Hydrantenbeauftragter"],
  ["Beauftragte", "LM d.S. Matthias Gfall", "Sanitätsbeauftragter", "Sanitätsbeauftragter"],
];

/**
 * Fuhrpark.
 *
 * TODO(Feuerwehr): Ausser beim TLFA fehlen die technischen Daten noch. Bisher
 * standen ueberall die Werte des TLFA - lieber eine ehrliche Luecke als
 * falsche Angaben. Nachtragen im Adminbereich unter "Fuhrpark".
 */
const FLEET = [
  {
    slug: "tlfa", short: "TLFA", category: "tlfa",
    name: "Tanklöschfahrzeug mit Allradantrieb",
    call_sign: "Tank Hausmannstätten",
    description:
      "Das Tanklöschfahrzeug ist unser Erstangriffsfahrzeug bei Bränden. Es bringt " +
      "Löschwasser, Schaummittel und die komplette Brandschutzausrüstung direkt an die " +
      "Einsatzstelle und versorgt bei Bedarf weitere Fahrzeuge mit Wasser.",
    specs: [
      { label: "Löschwasser", value: "3.000 l" },
      { label: "Schaummittel", value: "200 l" },
      { label: "Motorleistung", value: "400 PS" },
      { label: "Baujahr", value: "2013" },
      { label: "Besatzung", value: "5+1 Sitze" },
    ],
    tasks: [
      "Brandbekämpfung im Innen- und Außenangriff",
      "Löschwasserversorgung über lange Wegstrecken",
      "Brandsicherheitswachen",
    ],
    photos: ["tlfa_closed", "tlfa_open"],
  },
  {
    slug: "krfs-t", short: "KRFS-T", category: "krfs-t",
    name: "Kleinrüstfahrzeug mit Seilwinde und Tank",
    description:
      "Das Kleinrüstfahrzeug ist bei technischen Einsätzen als Erstes vor Ort. Die " +
      "Seilwinde und der hydraulische Rettungssatz machen es zum wichtigsten Gerät bei " +
      "Verkehrsunfällen und Fahrzeugbergungen.",
    specs: [],
    tasks: [
      "Technische Hilfeleistung und Menschenrettung",
      "Fahrzeugbergung mit Seilwinde",
      "Sturm- und Unwettereinsätze",
    ],
    photos: ["krf_closed", "krf_open"],
  },
  {
    slug: "mzfa", short: "MZFA", category: "mzfa",
    name: "Mehrzweckfahrzeug mit Allradantrieb",
    description:
      "Das Mehrzweckfahrzeug ist der Alleskönner im Fuhrpark: Es transportiert " +
      "Mannschaft und Gerät, zieht Anhänger und kommt auch abseits befestigter Wege ans Ziel.",
    specs: [],
    tasks: [
      "Transport von Mannschaft und Zusatzgerät",
      "Zugfahrzeug für Anhänger",
      "Einsätze im unwegsamen Gelände",
    ],
    photos: ["mzfa_closed", "mzfa_open"],
  },
  {
    slug: "mtf", short: "MTF", category: "mtf",
    name: "Mannschaftstransportfahrzeug",
    description:
      "Das Mannschaftstransportfahrzeug bringt Einsatzkräfte zu Übungen, Schulungen " +
      "und Einsatzstellen. Es wird außerdem für Fahrten der Jugendgruppe genutzt.",
    specs: [],
    tasks: [
      "Transport von Einsatzkräften",
      "Fahrten zu Übungen, Kursen und Bewerben",
      "Erkundungsfahrten",
    ],
    photos: ["mtf_closed", "mtf_open"],
  },
  {
    slug: "tsa", short: "TSA", category: "tsa",
    name: "Tragkraftspritzenanhänger",
    description:
      "Der Tragkraftspritzenanhänger trägt die Tragkraftspritze samt Saug- und " +
      "Druckschläuchen. Er wird angehängt, wenn an der Einsatzstelle Wasser aus " +
      "offenen Gewässern oder Löschteichen entnommen werden muss.",
    specs: [],
    tasks: [
      "Wasserentnahme aus offenen Gewässern",
      "Aufbau langer Löschwasserleitungen",
      "Unterstützung bei Flurbränden",
    ],
    photos: ["tsa_closed", "tsa_open"],
  },
];

/** Beschriftung je nach Bildvariante. */
const photoCaption = (file) =>
  file.endsWith("_open")
    ? "Geöffnete Geräteräume mit der Beladung"
    : "Fahrzeug von außen, Rollläden geschlossen";

/** Bilder aus dem Frontend uebernehmen, damit der Seed ohne Netz auskommt. */
const SEED_IMAGES = [
  "FFHausMitAutos.jpg",
  "FFHausVorne.jpg",
  "FFHausSeitlich.jpg",
  "IMG_9432.JPG",
  "sam_3937.jpg",
  "Friedenslicht.png",
];

const html = (paragraphs, images = []) =>
  [
    ...paragraphs.map((text) => `<p>${text}</p>`),
    ...images.map((url) => `<figure><img src="${url}" alt="" /></figure>`),
  ].join("\n");

const clear = () => {
  // Ohne AUTOINCREMENT gibt es keine sqlite_sequence: die IDs beginnen nach
  // dem Leeren der Tabellen von selbst wieder bei 1.
  db.exec(
    "DELETE FROM post_categories; DELETE FROM posts; DELETE FROM media; " +
    "DELETE FROM vehicles; DELETE FROM members; DELETE FROM categories;"
  );
};

const seedImages = () => {
  const publicImages = path.join(__dirname, "..", "..", "public", "images");
  const media = {};

  for (const name of SEED_IMAGES) {
    const source = path.join(publicImages, name);
    if (!fs.existsSync(source)) continue;
    fs.copyFileSync(source, path.join(UPLOAD_DIR, name));
    const ext = path.extname(name).toLowerCase();
    media[name] = repo.createMedia({
      filename: name,
      mimeType: ext === ".png" ? "image/png" : "image/jpeg",
      sourceUrl: `/uploads/${name}`,
      altText: "Feuerwehr Hausmannstätten",
      folder: "Rüsthaus",
    });
  }
  return media;
};

/**
 * Fahrzeugfotos uebernehmen. Bevorzugt WebP (rund ein Drittel der Groesse),
 * faellt auf PNG zurueck, falls die optimierten Dateien fehlen.
 */
const seedVehiclePhotos = () => {
  const source = path.join(__dirname, "..", "..", "public", "images", "nobg");
  const media = {};
  if (!fs.existsSync(source)) return media;

  for (const vehicle of FLEET) {
    for (const file of vehicle.photos) {
      for (const ext of [".webp", ".png"]) {
        const from = path.join(source, file + ext);
        if (!fs.existsSync(from)) continue;
        const name = file + ext;
        fs.copyFileSync(from, path.join(UPLOAD_DIR, name));
        media[file] = repo.createMedia({
          filename: name,
          mimeType: ext === ".webp" ? "image/webp" : "image/png",
          sourceUrl: "/uploads/" + name,
          altText: vehicle.short + " - " + photoCaption(file),
          folder: "Fahrzeuge",
        });
        break;
      }
    }
  }
  return media;
};

const run = () => {
  const existing = repo.listCategories({ perPage: 1 }).total;
  if (existing > 0 && !reset) {
    console.log(`Datenbank enthaelt bereits ${existing} Kategorien. Mit --reset neu aufbauen.`);
    return;
  }
  if (reset) clear();

  const bySlug = {};
  for (const category of TOP_LEVEL) {
    bySlug[category.slug] = repo.createCategory({ ...category, parent: 0 });
  }
  const addChildren = (parentSlug, children) => {
    for (const child of children) {
      bySlug[child.slug] = repo.createCategory({ ...child, parent: bySlug[parentSlug].id });
    }
  };
  addChildren("einsatze", TYPES);
  addChildren("fahrzeuge", VEHICLES);
  addChildren("einsatzmittel", ORGANISATIONS);

  const media = seedImages();
  const image = (name) => media[name];
  const url = (name) => (media[name] ? media[name].source_url : undefined);

  const posts = [
    {
      title: "Fahrzeugbergung nach Verkehrsunfall auf der B73",
      excerpt: "Ein PKW kam von der Fahrbahn ab und blieb in der Böschung liegen.",
      date: "2026-08-24T18:42:00",
      featured: "FFHausMitAutos.jpg",
      categories: ["technischer-einsatz", "krfs-t", "mzfa", "rotes-kreuz", "polizei"],
      paragraphs: [
        "Am frühen Abend wurden wir gemeinsam mit dem Roten Kreuz zu einem Verkehrsunfall auf der B73 alarmiert.",
        "Der Lenker konnte sein Fahrzeug selbstständig verlassen und wurde vom Rettungsdienst versorgt. Wir sicherten die Unfallstelle ab, klemmten die Batterie ab und bargen den PKW mit der Seilwinde des KRFS-T.",
        "Nach rund 90 Minuten konnte die Fahrbahn wieder freigegeben werden.",
      ],
      photos: ["FFHausMitAutos.jpg", "FFHausVorne.jpg"],
    },
    {
      title: "Kaminbrand in der Hauptstraße",
      excerpt: "Ausgebrannter Kamin im Ortszentrum, keine Verletzten.",
      date: "2026-07-11T07:05:00",
      featured: "FFHausVorne.jpg",
      categories: ["brandeinsatz", "tlfa", "mtf", "ff-vasoldsberg"],
      paragraphs: [
        "Kurz nach 7 Uhr wurde ein Kaminbrand gemeldet. Beim Eintreffen war bereits dichter Rauch aus dem Kamin sichtbar.",
        "Mit Kaminkehrwerkzeug und unter schwerem Atemschutz wurde der Kamin ausgekehrt und laufend mit der Wärmebildkamera kontrolliert. Die FF Vasoldsberg unterstützte mit einer zusätzlichen Atemschutzgruppe.",
        "Das Gebäude blieb unbeschädigt, verletzt wurde niemand.",
      ],
      photos: ["FFHausVorne.jpg"],
    },
    {
      title: "Ölspur nach Hydraulikschaden",
      excerpt: "Rund 400 Meter Ölspur im Gemeindegebiet gebunden.",
      date: "2026-06-02T14:20:00",
      featured: "FFHausSeitlich.jpg",
      categories: ["schadstoffeinsatz", "mzfa", "polizei"],
      paragraphs: [
        "Ein Traktor verlor durch einen Hydraulikschaden Öl auf einer Länge von rund 400 Metern.",
        "Die Fahrbahn wurde mit Bindemittel abgestreut, aufgekehrt und der Sondermüll fachgerecht entsorgt.",
      ],
      photos: [],
    },
    {
      title: "Abschnittsübung Menschenrettung aus Fahrzeugwrack",
      excerpt: "Gemeinsame Übung mit den Nachbarwehren am Übungsgelände.",
      date: "2026-05-17T18:00:00",
      featured: "IMG_9432.JPG",
      categories: ["uebung", "krfs-t", "tlfa", "ff-fernitz", "ff-vasoldsberg", "notarzt"],
      paragraphs: [
        "Bei der diesjährigen Abschnittsübung stand die schonende Rettung einer eingeklemmten Person im Mittelpunkt.",
        "Geübt wurden Fahrzeugstabilisierung, Glasmanagement und das Öffnen der Fahrgastzelle mit hydraulischem Rettungsgerät. Der Notarzt begleitete die Übung und gab Rückmeldung zur medizinischen Betreuung.",
        "Im Anschluss fand die gemeinsame Übungsbesprechung im Rüsthaus statt.",
      ],
      photos: ["IMG_9432.JPG", "sam_3937.jpg"],
    },
    {
      title: "Sturmschaden: Baum auf Fahrbahn",
      excerpt: "Nach dem Gewitter blockierte ein Baum die Zufahrt.",
      date: "2026-04-28T21:15:00",
      featured: "sam_3937.jpg",
      categories: ["technischer-einsatz", "mzfa", "mtf"],
      paragraphs: [
        "Ein Gewitter mit Sturmböen sorgte für mehrere Schadensmeldungen im Gemeindegebiet.",
        "Ein umgestürzter Baum wurde mit der Motorsäge zerkleinert und die Fahrbahn geräumt.",
      ],
      photos: ["sam_3937.jpg"],
    },
    {
      title: "Friedenslicht-Aktion im Rüsthaus",
      excerpt: "Das Friedenslicht konnte wieder im Rüsthaus abgeholt werden.",
      date: "2025-12-24T09:00:00",
      featured: "Friedenslicht.png",
      categories: ["taetigkeit", "mtf"],
      paragraphs: [
        "Wie jedes Jahr konnte das Friedenslicht am Vormittag des 24. Dezember im Rüsthaus abgeholt werden.",
        "Wir bedanken uns bei allen Besucherinnen und Besuchern für die zahlreichen Spenden.",
      ],
      photos: ["Friedenslicht.png"],
    },
    {
      title: "Brandsicherheitswache beim Ortsfest",
      excerpt: "Begleitung des Ortsfestes mit einer Brandsicherheitswache.",
      date: "2025-09-06T16:00:00",
      featured: "FFHausMitAutos.jpg",
      categories: ["taetigkeit", "tlfa", "rotes-kreuz"],
      paragraphs: [
        "Beim Ortsfest stellte die Feuerwehr eine Brandsicherheitswache und unterstützte beim Verkehrsdienst.",
        "Der Einsatz verlief ohne besondere Vorkommnisse.",
      ],
      photos: [],
    },
    {
      title: "Wasserversorgung bei Flurbrand",
      excerpt: "Unterstützung der Nachbarwehr bei einem Flurbrand.",
      date: "2025-08-14T13:30:00",
      featured: "FFHausSeitlich.jpg",
      categories: ["brandeinsatz", "tlfa", "tsa", "ff-fernitz", "drohnenteam"],
      paragraphs: [
        "Zur Unterstützung der Nachbarwehr wurden wir zu einem Flurbrand nachalarmiert.",
        "Unsere Aufgabe war der Aufbau der Wasserversorgung über eine Relaisleitung. Das Drohnenteam kontrollierte die Brandfläche aus der Luft auf Glutnester.",
      ],
      photos: ["FFHausSeitlich.jpg"],
    },
  ];

  for (const post of posts) {
    // Jeder Beitrag haengt zusaetzlich in der Elternkategorie "einsatze":
    // genau danach fragt das Frontend beim Laden der Startseite.
    const categoryIds = [bySlug.einsatze.id, ...post.categories.map((slug) => bySlug[slug].id)];
    repo.createPost({
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      categories: categoryIds,
      featured_media: image(post.featured) ? image(post.featured).id : 0,
      content: html(post.paragraphs, post.photos.map(url).filter(Boolean)),
    });
  }

  MEMBERS.forEach(([team, name, rank, func], index) => {
    repo.createMember({ team, name, rank, function: func, sort_order: index });
  });

  const vehiclePhotos = seedVehiclePhotos();
  FLEET.forEach((vehicle, index) => {
    repo.createVehicle({
      slug: vehicle.slug,
      short: vehicle.short,
      name: vehicle.name,
      call_sign: vehicle.call_sign || "",
      description: vehicle.description,
      specs: vehicle.specs,
      tasks: vehicle.tasks,
      photos: vehicle.photos
        .filter((file) => vehiclePhotos[file])
        .map((file) => ({ url: vehiclePhotos[file].source_url, caption: photoCaption(file) })),
      // Verknuepfung mit der gleichnamigen Kategorie, damit Einsaetze und
      // Fuhrpark auf dasselbe Fahrzeug zeigen.
      category_id: bySlug[vehicle.category] ? bySlug[vehicle.category].id : 0,
      sort_order: index,
    });
  });

  console.log(
    `Seed fertig: ${repo.listCategories({ perPage: 1 }).total} Kategorien, ` +
    `${repo.listPosts({ perPage: 1 }).total} Beitraege, ` +
    `${repo.listMedia({ perPage: 1 }).total} Medien, ` +
    `${repo.listMembers().length} Mitglieder, ` +
    `${repo.listVehicles().length} Fahrzeuge.`
  );
};

run();
