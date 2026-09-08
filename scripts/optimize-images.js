/* eslint-disable no-console */
/**
 * Verkleinert die Bilder in public/images auf Anzeigegroesse und legt
 * zusaetzlich WebP-Varianten an.
 *
 * Die Originale (5472x3648, teils >10 MB) werden nach public/images/_original
 * verschoben. Dieser Ordner ist in .gitignore und wird nicht deployt.
 *
 *   npm run images
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const IMAGES_DIR = path.join(__dirname, "..", "public", "images");
const ORIGINALS_DIR = path.join(__dirname, "..", "image-originals");

/** Zielbreiten je nach Verwendung im Layout. */
const TARGETS = [
    { match: /^nobg[/\\].*\.png$/i, width: 1600, kind: "png" },
    { match: /^(FFHausMitAutos|FFHausSeitlich|FFHausVorne)\.jpg$/i, width: 1920, kind: "jpg" },
    { match: /^sam_3937\.jpg$/i, width: 1920, kind: "jpg" },
    { match: /^Friedenslicht\.png$/i, width: 1000, kind: "png" },
    { match: /^IMG_9432\.JPG$/i, width: 900, kind: "jpg" },
];

const walk = (dir, base = "") =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        if (entry.name === "_original") return [];
        const rel = path.join(base, entry.name);
        const abs = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(abs, rel) : [rel];
    });

const mb = (bytes) => (bytes / 1048576).toFixed(2);

(async () => {
    if (!fs.existsSync(IMAGES_DIR)) {
        console.error(`Ordner nicht gefunden: ${IMAGES_DIR}`);
        process.exit(1);
    }

    const files = walk(IMAGES_DIR).filter((f) => /\.(png|jpe?g)$/i.test(f));
    let before = 0;
    let after = 0;
    let processed = 0;

    for (const rel of files) {
        const target = TARGETS.find((t) => t.match.test(rel.replace(/\\/g, "/")));
        if (!target) continue;

        const abs = path.join(IMAGES_DIR, rel);
        const originalPath = path.join(ORIGINALS_DIR, rel);

        // Bereits verarbeitet? Dann liegt das Original schon im Archiv.
        if (fs.existsSync(originalPath)) {
            console.log(`uebersprungen (bereits optimiert): ${rel}`);
            continue;
        }

        const sizeBefore = fs.statSync(abs).size;
        const meta = await sharp(abs).metadata();

        const webpPath = abs.replace(/\.(png|jpe?g)$/i, ".webp");
        const alreadySmall = Boolean(meta.width && meta.width <= target.width);

        if (alreadySmall && fs.existsSync(webpPath)) {
            console.log(`uebersprungen (klein genug): ${rel}`);
            continue;
        }

        fs.mkdirSync(path.dirname(originalPath), { recursive: true });
        fs.copyFileSync(abs, originalPath);

        const pipeline = sharp(originalPath).resize({
            width: target.width,
            withoutEnlargement: true,
        });

        if (target.kind === "png") {
            // Freigestellte Fahrzeuge brauchen den Alphakanal.
            await pipeline.clone().png({ quality: 82, compressionLevel: 9, palette: true }).toFile(abs);
        } else {
            await pipeline.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(abs);
        }

        await pipeline.clone().webp({ quality: 78 }).toFile(webpPath);

        const sizeAfter = fs.statSync(abs).size + fs.statSync(webpPath).size;
        before += sizeBefore;
        after += sizeAfter;
        processed += 1;

        console.log(
            `${rel}: ${mb(sizeBefore)} MB -> ${mb(sizeAfter)} MB (inkl. WebP), ${meta.width}px -> ${target.width}px`
        );
    }

    console.log(
        `\n${processed} Bilder optimiert: ${mb(before)} MB -> ${mb(after)} MB ` +
        `(${before > 0 ? Math.round((1 - after / before) * 100) : 0} % kleiner).`
    );
    console.log(`Originale liegen in ${path.relative(process.cwd(), ORIGINALS_DIR)}`);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
