export interface IMember {
    id: number;
    name: string;
    /** Dienstgrad, z. B. "Hauptbrandinspektor". */
    rank: string;
    /** Funktion in der Wehr, z. B. "Kommandant". */
    function: string;
    /** Gruppe für die Gliederung der Seite, z. B. "Kommando". */
    team: string;
    sortOrder: number;
    /** Leer, solange kein Portrait hinterlegt ist. */
    portraitUrl: string;
}
