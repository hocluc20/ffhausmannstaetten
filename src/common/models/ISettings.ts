/**
 * Kennzahlen der Startseite.
 *
 * members/vehicles/foundedYear pflegt die Redaktion im Adminbereich.
 * operationsThisYear wird vom Server aus den erfassten Einsätzen gezählt und
 * ist bewusst nicht editierbar.
 */
export interface ISettings {
    members: number;
    vehicles: number;
    foundedYear: number;
    operationsThisYear: number;
    year: number;
    /** false blendet die Seite „Mannschaft“ samt Menüpunkt aus. */
    membersVisible: boolean;
}

export const DEFAULT_SETTINGS: ISettings = {
    members: 104,
    vehicles: 5,
    foundedYear: 1889,
    operationsThisYear: 0,
    year: new Date().getFullYear(),
    membersVisible: true,
};
