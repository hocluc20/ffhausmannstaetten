import { IVehicleDetail } from "../common/models/IVehicleDetail";

/**
 * Mitgelieferter Fuhrpark.
 *
 * Gepflegt wird der Fuhrpark im Adminbereich unter „Fuhrpark“; diese Liste
 * greift nur, solange das Backend nichts liefert (alte WordPress-Instanz,
 * Netzwerkfehler, noch nichts eingetragen). So bleibt die Seite nie leer.
 *
 * Die Bilder liegen als WebP mit PNG als Rückfallebene im Frontend; aus dem
 * Backend kommt jeweils nur eine URL.
 */
const photo = (file: string, caption: string) => ({
    url: `/images/nobg/${file}.webp`,
    fallbackUrl: `/images/nobg/${file}.png`,
    caption,
});

const CLOSED = "Fahrzeug von außen, Rollläden geschlossen";
const OPEN = "Geöffnete Geräteräume mit der Beladung";

export const FALLBACK_VEHICLES: IVehicleDetail[] = [
    {
        id: -1,
        slug: "tlfa",
        short: "TLFA",
        name: "Tanklöschfahrzeug mit Allradantrieb",
        callSign: "Tank Hausmannstätten",
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
        photos: [photo("tlfa_closed", CLOSED), photo("tlfa_open", OPEN)],
        categoryId: 0,
        sortOrder: 0,
    },
    {
        id: -2,
        slug: "krfs-t",
        short: "KRFS-T",
        name: "Kleinrüstfahrzeug mit Seilwinde und Tank",
        callSign: "",
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
        photos: [photo("krf_closed", CLOSED), photo("krf_open", OPEN)],
        categoryId: 0,
        sortOrder: 1,
    },
    {
        id: -3,
        slug: "mzfa",
        short: "MZFA",
        name: "Mehrzweckfahrzeug mit Allradantrieb",
        callSign: "",
        description:
            "Das Mehrzweckfahrzeug ist der Alleskönner im Fuhrpark: Es transportiert " +
            "Mannschaft und Gerät, zieht Anhänger und kommt auch abseits befestigter Wege ans Ziel.",
        specs: [],
        tasks: [
            "Transport von Mannschaft und Zusatzgerät",
            "Zugfahrzeug für Anhänger",
            "Einsätze im unwegsamen Gelände",
        ],
        photos: [photo("mzfa_closed", CLOSED), photo("mzfa_open", OPEN)],
        categoryId: 0,
        sortOrder: 2,
    },
    {
        id: -4,
        slug: "mtf",
        short: "MTF",
        name: "Mannschaftstransportfahrzeug",
        callSign: "",
        description:
            "Das Mannschaftstransportfahrzeug bringt Einsatzkräfte zu Übungen, Schulungen " +
            "und Einsatzstellen. Es wird außerdem für Fahrten der Jugendgruppe genutzt.",
        specs: [],
        tasks: [
            "Transport von Einsatzkräften",
            "Fahrten zu Übungen, Kursen und Bewerben",
            "Erkundungsfahrten",
        ],
        photos: [
            photo("mtf_closed", "Fahrzeug von außen, Türen geschlossen"),
            photo("mtf_open", "Geöffneter Innenraum"),
        ],
        categoryId: 0,
        sortOrder: 3,
    },
    {
        id: -5,
        slug: "tsa",
        short: "TSA",
        name: "Tragkraftspritzenanhänger",
        callSign: "",
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
        photos: [
            photo("tsa_closed", "Anhänger von außen, geschlossen"),
            photo("tsa_open", "Geöffnet mit Tragkraftspritze und Beladung"),
        ],
        categoryId: 0,
        sortOrder: 4,
    },
];

/** Backend bevorzugt, mitgelieferte Liste als Rückfallebene. */
export const resolveFleet = (fromApi: IVehicleDetail[]): IVehicleDetail[] =>
    fromApi.length > 0 ? fromApi : FALLBACK_VEHICLES;

export const findVehicle = (
    fleet: IVehicleDetail[],
    slug?: string
): IVehicleDetail | undefined => fleet.find((vehicle) => vehicle.slug === slug);
