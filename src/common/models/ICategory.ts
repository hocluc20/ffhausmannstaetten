/** Unterscheidet echte Einsätze von sonstigen Tätigkeiten (Übungen, Feste …). */
export type OperationKind = "einsatz" | "taetigkeit";

export interface ICategory {
    id: number;
    name: string;
    slug: string;
    parent: number;
    description: string;
    /**
     * Nur bei Unterkategorien von "einsatze" aussagekräftig. Kommt aus
     * meta.kind der API; fehlt das Feld (ältere Backends), gilt "einsatz".
     */
    kind: OperationKind;
}
