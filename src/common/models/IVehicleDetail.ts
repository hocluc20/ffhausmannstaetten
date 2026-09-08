export interface IVehicleSpec {
    label: string;
    value: string;
}

export interface IVehiclePhoto {
    url: string;
    caption: string;
    /** Nur bei den mitgelieferten Standardbildern gesetzt (PNG neben WebP). */
    fallbackUrl?: string;
}

/**
 * Fahrzeug mit allen Angaben der Detailseite.
 *
 * Kommt aus dem Backend; fehlt dieses, greift die mitgelieferte Liste in
 * src/data/vehicles.ts, damit der Fuhrpark nie leer bleibt.
 */
export interface IVehicleDetail {
    id: number;
    slug: string;
    /** Kurzbezeichnung wie am Fahrzeug, z. B. "TLFA". */
    short: string;
    name: string;
    callSign: string;
    description: string;
    specs: IVehicleSpec[];
    tasks: string[];
    photos: IVehiclePhoto[];
    /** Verknüpfte Kategorie, über die Einsätze dieses Fahrzeug nennen. */
    categoryId: number;
    sortOrder: number;
}
