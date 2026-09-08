import { IMember } from "../common/models/IMember";

/**
 * Mitgelieferte Mannschaftsliste.
 *
 * Gepflegt wird die Mannschaft im Adminbereich unter „Mannschaft“; diese
 * Liste greift nur, solange das Backend nichts liefert. So bleibt die Seite
 * nie leer.
 *
 * TODO(Feuerwehr): Das Impressum nennt HBI Daniel Rothdeutsch als
 * Kommandanten, diese Liste HBI Thomas Molidor. Eine der beiden Angaben ist
 * veraltet - bitte prüfen.
 */
const member = (
    id: number,
    team: string,
    name: string,
    rank: string,
    fn: string
): IMember => ({ id, team, name, rank, function: fn, sortOrder: id, portraitUrl: "" });

export const FALLBACK_MEMBERS: IMember[] = [
    member(1, "Kommando", "HBI Thomas Molidor", "Hauptbrandinspektor", "Kommandant"),
    member(2, "Kommando", "OBI Johannes Lafer", "Oberbrandinspektor", "Stv. Kommandant"),

    member(3, "Zugskommandanten", "BI Robert Zaunschirm", "Zugskommandant", "Übungsbeauftragter"),
    member(4, "Zugskommandanten", "HBI a.D. Robert Molidor", "Zugskommandant", "Katastrophenschutzbeauftragter"),
    member(5, "Zugskommandanten", "BM Gernot Lukas", "Zugskommandant", "Kraftfahrerbeauftragter"),

    member(6, "Gruppenkommandanten", "OBI a.D. Thomas Maier-Pongratz", "Gruppenkommandant", "ÖFAST-Beauftragter"),
    member(7, "Gruppenkommandanten", "HLM Roland Helm", "Gruppenkommandant", "MRAS-Beauftragter"),
    member(8, "Gruppenkommandanten", "HLM Robert Matzer", "Gruppenkommandant", ""),
    member(9, "Gruppenkommandanten", "OLM Martin Pechmann", "Gruppenkommandant", "Geräte- und Maschinenmeister"),
    member(10, "Gruppenkommandanten", "LM Lukas Barrett", "Gruppenkommandant", "Geräte- und Maschinenmeister"),
    member(11, "Gruppenkommandanten", "LM Thomas Lechner", "Gruppenkommandant", "Kassier"),

    member(12, "Beauftragte", "LM d.V. Christoph Winkler", "Verwaltungsbeauftragter", "Schriftführer"),
    member(13, "Beauftragte", "LM d.V. Lukas Hochfellner", "Verwaltungsbeauftragter", "EDV-Beauftragter"),
    member(14, "Beauftragte", "LM d.F. Fabian Pußwald", "Fachdienstbeauftragter", "Funkbeauftragter"),
    member(15, "Beauftragte", "OLM d.F. Daniel Laipold", "Fachdienstbeauftragter", "Küchenbeauftragter"),
    member(16, "Beauftragte", "OLM d.F. Clemens Lafer", "Fachdienstbeauftragter", "Hydrantenbeauftragter"),
    member(17, "Beauftragte", "LM d.S. Matthias Gfall", "Sanitätsbeauftragter", "Sanitätsbeauftragter"),
];

/** Backend bevorzugt, mitgelieferte Liste als Rückfallebene. */
export const resolveMembers = (fromApi: IMember[]): IMember[] =>
    fromApi.length > 0 ? fromApi : FALLBACK_MEMBERS;

/**
 * Nach Gruppe gliedern, Reihenfolge der Gruppen wie sie zuerst vorkommen.
 * So bestimmt die Redaktion über sort_order auch die Reihenfolge der Gruppen.
 */
export const groupMembers = (members: IMember[]): [string, IMember[]][] => {
    const groups = new Map<string, IMember[]>();
    for (const entry of [...members].sort((a, b) => a.sortOrder - b.sortOrder)) {
        const team = entry.team || "Mannschaft";
        if (!groups.has(team)) groups.set(team, []);
        groups.get(team)!.push(entry);
    }
    return [...groups.entries()];
};
