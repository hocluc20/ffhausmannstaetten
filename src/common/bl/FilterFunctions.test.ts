import {
    filterOrganizationsFromCategories,
    filterPhotosFromContent,
    filterTextFromContent,
    filterTypeFromCategories,
    filterVehiclesFromCategories,
    listTypes,
    stripHtml,
} from "./FilterFunctions";
import { ICategory } from "../models/ICategory";

/** kind ist nur bei den Arten (Kindern von "einsatze") aussagekräftig. */
const cat = (
    id: number,
    name: string,
    slug: string,
    parent: number,
    description = "",
    kind: ICategory["kind"] = "einsatz"
): ICategory => ({ id, name, slug, parent, description, kind });

const categories: ICategory[] = [
    cat(1, "Fahrzeuge", "fahrzeuge", 0),
    cat(2, "TLFA", "tlfa", 1, "Tanklöschfahrzeug"),
    cat(3, "MTF", "mtf", 1, "Mannschaftstransportfahrzeug"),

    cat(10, "Einsatzmittel", "einsatzmittel", 0),
    cat(11, "FF Hausmannstätten", "ff-hausmannstaetten", 10),
    cat(12, "FF Vasoldsberg", "ff-vasoldsberg", 10),

    cat(20, "Einsätze", "einsatze", 0),
    cat(21, "Brandeinsatz", "brandeinsatz", 20, "Brand", "einsatz"),
    cat(22, "Technischer Einsatz", "technisch", 20, "Technik", "einsatz"),
    cat(23, "Übung", "uebung", 20, "Ausbildung", "taetigkeit"),
];

describe("Kategorie-Filter", () => {
    it("liefert nur die Fahrzeuge des jeweiligen Beitrags", () => {
        const result = filterVehiclesFromCategories(categories, [2, 11, 21]);
        expect(result.map((v) => v.name_short)).toEqual(["TLFA"]);
    });

    it("liefert nur die Organisationen des jeweiligen Beitrags", () => {
        const result = filterOrganizationsFromCategories(categories, [12, 22]);
        expect(result).toEqual(["FF Vasoldsberg"]);
    });

    it("liefert die Einsatzart des jeweiligen Beitrags, nicht immer die erste", () => {
        // Der eigentliche Regressionstest: vorher kam fuer jeden Beitrag
        // dieselbe (erste) Einsatzart zurueck.
        expect(filterTypeFromCategories(categories, [21])?.name_short).toBe("Brandeinsatz");
        expect(filterTypeFromCategories(categories, [22])?.name_short).toBe("Technischer Einsatz");
    });

    it("gibt undefined zurueck, wenn dem Beitrag keine Einsatzart zugeordnet ist", () => {
        expect(filterTypeFromCategories(categories, [11])).toBeUndefined();
    });

    it("wirft nicht, wenn eine Kategorie fehlt", () => {
        // Frueher: vehicleID[0].id auf einem leeren Array -> TypeError, der
        // den gesamten Ladevorgang abgebrochen hat.
        expect(() => filterVehiclesFromCategories([], [1])).not.toThrow();
        expect(() => filterOrganizationsFromCategories([], [1])).not.toThrow();
        expect(() => filterTypeFromCategories([], [1])).not.toThrow();

        expect(filterVehiclesFromCategories([], [1])).toEqual([]);
        expect(filterOrganizationsFromCategories([], [1])).toEqual([]);
        expect(filterTypeFromCategories([], [1])).toBeUndefined();
    });

    it("faellt auf alle Unterkategorien zurueck, wenn kein Beitrag angegeben ist", () => {
        expect(filterVehiclesFromCategories(categories)).toHaveLength(2);
    });
});

describe("Einsatz und Taetigkeit auseinanderhalten", () => {
    it("uebernimmt die Art (kind) aus der Kategorie", () => {
        expect(filterTypeFromCategories(categories, [21])?.kind).toBe("einsatz");
        expect(filterTypeFromCategories(categories, [23])?.kind).toBe("taetigkeit");
    });

    it("listet alle Arten alphabetisch fuer die Filterleiste", () => {
        const types = listTypes(categories);
        expect(types.map((t) => t.name_short)).toEqual([
            "Brandeinsatz",
            "Technischer Einsatz",
            "Übung",
        ]);
        expect(types.filter((t) => t.kind === "taetigkeit")).toHaveLength(1);
    });

    it("liefert eine leere Liste, wenn es keine Arten gibt", () => {
        expect(listTypes([])).toEqual([]);
    });
});

describe("Inhaltsfilter", () => {
    it("liest Bild-URLs aus dem Beitragsinhalt", () => {
        const content = '<p>Text</p><img src="https://example.org/a.jpg" /><img src=\'/b.png\'>';
        expect(filterPhotosFromContent(content)).toEqual([
            "https://example.org/a.jpg",
            "/b.png",
        ]);
    });

    it("liest Absaetze und wandelt Zeilenumbrueche um", () => {
        const content = "<p>Erste Zeile<br />Zweite Zeile</p><p>Dritter Absatz</p>";
        expect(filterTextFromContent(content)).toEqual([
            "Erste Zeile\nZweite Zeile",
            "Dritter Absatz",
        ]);
    });

    it("entfernt HTML und dekodiert Entities", () => {
        expect(stripHtml("<p>Brand &amp; Rauch</p>")).toBe("Brand & Rauch");
        expect(stripHtml("")).toBe("");
    });
});
