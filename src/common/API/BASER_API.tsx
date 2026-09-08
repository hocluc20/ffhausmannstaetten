/**
 * author: simon
 * date: 29.11.2024
 * project: ffhausmannstaetten
 * package_name:
 **/
import {ICategory, OperationKind} from "../models/ICategory";
import {IPost} from "../models/IPost";
import {DEFAULT_SETTINGS, ISettings} from "../models/ISettings";
import {IMember} from "../models/IMember";
import {IVehicleDetail} from "../models/IVehicleDetail";

/**
 * Basis-URL der WordPress-REST-API.
 *
 * Über REACT_APP_API_BASE konfigurierbar, damit Staging und Produktion sich
 * unterscheiden können. Der Fallback ist bewusst HTTPS: über HTTP werden die
 * Requests von jeder HTTPS-Seite als Mixed Content blockiert.
 */
const BASE_URL =
    process.env.REACT_APP_API_BASE?.replace(/\/+$/, "") ??
    "http://ff-hausmann.bplaced.net/index.php/wp-json/wp/v2";

/** Requests brechen ab, statt die Seite unbegrenzt im Ladezustand zu lassen. */
const REQUEST_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
    constructor(message: string, readonly status?: number) {
        super(message);
        this.name = "ApiError";
    }
}

const request = async <T, >(path: string): Promise<T> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${BASE_URL}${path}`, {signal: controller.signal});
        if (!response.ok) {
            throw new ApiError(
                `Anfrage an ${path} fehlgeschlagen (HTTP ${response.status}).`,
                response.status
            );
        }
        return (await response.json()) as T;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new ApiError(`Zeitüberschreitung bei der Anfrage an ${path}.`);
        }
        throw new ApiError(`Die Feuerwehr-Daten konnten nicht geladen werden.`);
    } finally {
        clearTimeout(timeout);
    }
};


/**
 * Mannschaft.
 *
 * Wie bei den Kennzahlen fehlertolerant: gegen eine alte WordPress-Instanz
 * gibt es diesen Endpunkt nicht. Dann bleibt die Liste leer und die Ansicht
 * greift auf ihre mitgelieferten Daten zurueck.
 */
export const fetchMembers = async (): Promise<IMember[]> => {
    try {
        const data = await request<any[]>("/members");
        return data.map((row) => ({
            id: row.id,
            name: row.name ?? "",
            rank: row.rank ?? "",
            function: row.function ?? "",
            team: row.team ?? "Mannschaft",
            sortOrder: row.sort_order ?? 0,
            portraitUrl: row.portrait_url ?? "",
        }));
    } catch {
        return [];
    }
};

/** Fuhrpark mit allen Angaben der Detailseite. */
export const fetchVehicles = async (): Promise<IVehicleDetail[]> => {
    try {
        const data = await request<any[]>("/vehicles");
        return data.map((row) => ({
            id: row.id,
            slug: row.slug,
            short: row.short ?? "",
            name: row.name ?? "",
            callSign: row.call_sign ?? "",
            description: row.description ?? "",
            specs: Array.isArray(row.specs) ? row.specs : [],
            tasks: Array.isArray(row.tasks) ? row.tasks : [],
            photos: Array.isArray(row.photos) ? row.photos : [],
            categoryId: row.category_id ?? 0,
            sortOrder: row.sort_order ?? 0,
        }));
    } catch {
        return [];
    }
};

/** meta.kind ist eine Erweiterung des eigenen Backends; WordPress liefert dort []. */
const readKind = (meta: any): OperationKind =>
    meta && !Array.isArray(meta) && meta.kind === "taetigkeit" ? "taetigkeit" : "einsatz";

export const fetchCategories = async (): Promise<ICategory[]> => {
    const data = await request<any[]>("/categories?per_page=100");
    return data.map(({id, name, slug, parent, description, meta}) => ({
        id,
        name,
        slug,
        parent,
        description,
        kind: readKind(meta),
    }));
};

const toNumber = (value: unknown, fallback: number): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * Kennzahlen der Startseite.
 *
 * Bewusst fehlertolerant: gegen eine alte WordPress-Instanz gibt es diesen
 * Endpunkt nicht. Dann gelten die Standardwerte, statt dass die Startseite
 * mit einer Fehlermeldung stehen bleibt.
 */
export const fetchSettings = async (): Promise<ISettings> => {
    try {
        const data = await request<Record<string, string>>("/settings");
        return {
            members: toNumber(data["stats.members"], DEFAULT_SETTINGS.members),
            vehicles: toNumber(data["stats.vehicles"], DEFAULT_SETTINGS.vehicles),
            foundedYear: toNumber(data["stats.foundedYear"], DEFAULT_SETTINGS.foundedYear),
            operationsThisYear: toNumber(data["stats.operationsThisYear"], DEFAULT_SETTINGS.operationsThisYear),
            year: toNumber(data["stats.year"], DEFAULT_SETTINGS.year),
            // Fehlt der Schlüssel (altes Backend), bleibt die Seite sichtbar.
            membersVisible: data["pages.membersVisible"] !== "0",
        };
    } catch {
        return {...DEFAULT_SETTINGS, year: new Date().getFullYear()};
    }
};

export const getRenderedImage = async (mediaId: number): Promise<string | undefined> => {
    try {
        const data = await request<any>(`/media/${mediaId}`);
        return data?.guid?.rendered ?? undefined;
    } catch {
        // Ein fehlendes Medium darf nicht die gesamte Liste kippen.
        return undefined;
    }
};

/**
 * Liest das Beitragsbild aus der _embed-Antwort, damit pro Beitrag kein
 * zusätzlicher Request nötig ist.
 */
const embeddedImage = (post: any): string | undefined => {
    const media = post?._embedded?.["wp:featuredmedia"]?.[0];
    if (!media || media.code) return undefined;
    return (
        media.media_details?.sizes?.large?.source_url ??
        media.media_details?.sizes?.medium_large?.source_url ??
        media.source_url ??
        media.guid?.rendered ??
        undefined
    );
};

export const fetchPostsByCategory = async (categoryId: number): Promise<IPost[]> => {
    const data = await request<any[]>(`/posts?categories=${categoryId}&per_page=100&_embed=1`);
    return data.map((post) => ({
        id: post.id,
        title: post.title?.rendered ?? "",
        content: post.content?.rendered ?? "",
        categories: post.categories ?? [],
        date: post.date,
        excerpt: post.excerpt?.rendered ?? "",
        featured_media: post.featured_media ?? 0,
        featured_media_url: embeddedImage(post),
    }));
};
