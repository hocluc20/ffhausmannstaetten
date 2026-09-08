import {ICategory} from "../models/ICategory";
import {IVehicle} from "../models/IVehicle";
import {IType} from "../models/IType";

/**
 * Liefert die direkten Unterkategorien eines Slugs.
 *
 * Fehlt der Slug in WordPress (umbenannt, gelöscht, noch nicht angelegt),
 * kommt eine leere Liste zurück. Vorher wurde hier ungeprüft auf [0]
 * zugegriffen, was den gesamten Datenladevorgang abgebrochen hat.
 */
const childrenOf = (categories: ICategory[], slug: string): ICategory[] => {
    const parent = categories.find((category) => category.slug === slug);
    if (!parent) {
        console.warn(`Kategorie "${slug}" wurde in der API nicht gefunden.`);
        return [];
    }
    return categories.filter((category) => category.parent === parent.id);
};

/**
 * Schränkt auf die Kategorien ein, die dem Beitrag tatsächlich zugeordnet sind.
 *
 * Wichtig ist der Unterschied zwischen "nicht angegeben" und "leer":
 * undefined heißt "kein Filter" (globale Abfrage, etwa für die Filterleiste),
 * eine leere Liste heißt "diesem Beitrag ist nichts zugeordnet". Früher galt
 * beides als "kein Filter" - ein Beitrag ohne Kategorien bekam dadurch die
 * erste Einsatzart zugewiesen und wurde als Einsatz gezählt.
 */
const restrictToPost = (categories: ICategory[], postCategoryIds?: number[]): ICategory[] => {
    if (postCategoryIds === undefined) return categories;
    return categories.filter((category) => postCategoryIds.includes(category.id));
};

export const filterVehiclesFromCategories = (
    categories: ICategory[],
    postCategoryIds?: number[]
): IVehicle[] =>
    restrictToPost(childrenOf(categories, "fahrzeuge"), postCategoryIds).map((c) => ({
        id: c.id,
        name_long: c.description,
        name_short: c.name,
    }));

export const filterOrganizationsFromCategories = (
    categories: ICategory[],
    postCategoryIds?: number[]
): string[] =>
    restrictToPost(childrenOf(categories, "einsatzmittel"), postCategoryIds).map((c) => c.name);

export const filterTypeFromCategories = (
    categories: ICategory[],
    postCategoryIds?: number[]
): IType | undefined => {
    const type = restrictToPost(childrenOf(categories, "einsatze"), postCategoryIds)[0];
    if (!type) return undefined;
    return {
        id: type.id,
        name_long: type.description,
        name_short: type.name,
        kind: type.kind,
    };
};

/** Alle Einsatz- und Tätigkeitsarten, für die Filterleiste. */
export const listTypes = (categories: ICategory[]): IType[] =>
    childrenOf(categories, "einsatze")
        .map((c) => ({id: c.id, name_short: c.name, name_long: c.description, kind: c.kind}))
        .sort((a, b) => a.name_short.localeCompare(b.name_short, "de"));

export const filterPhotosFromContent = (content: string): string[] => {
    const photoRegex = /<img[^>]+src=["']([^"']+)["']/g;
    const photos: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = photoRegex.exec(content)) !== null) {
        photos.push(match[1]);
    }

    return photos;
};

export const filterTextFromContent = (content: string): string[] => {
    const textRegex = /<(p|pre)[^>]*>(.*?)<\/\1>/gs;
    const extractedText: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = textRegex.exec(content)) !== null) {
        extractedText.push(match[2].replace(/<br\s*\/?>/gi, "\n").trim());
    }

    return extractedText;
};

/** Entfernt HTML-Reste und dekodiert Entities aus WordPress-Feldern. */
export const stripHtml = (value: string): string => {
    if (!value) return "";
    const withoutTags = value.replace(/<[^>]*>/g, " ");
    const textarea = document.createElement("textarea");
    textarea.innerHTML = withoutTags;
    return textarea.value.replace(/\s+/g, " ").trim();
};
