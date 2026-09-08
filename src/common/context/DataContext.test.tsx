import React from "react";
import { render, screen } from "@testing-library/react";
import { APIProvider, useAPI } from "./DataContext";

/** Zeigt die relevanten Zustaende des Contexts als Text an. */
const Probe: React.FC = () => {
    const { isLoading, error, operations } = useAPI();
    if (isLoading) return <p>laden</p>;
    if (error) return <p>fehler: {error}</p>;
    return (
        <ul>
            {operations.map((operation) => (
                <li key={operation.id}>
                    {operation.title} | {operation.type?.name_short ?? "ohne Art"} | {operation.kind}
                </li>
            ))}
        </ul>
    );
};

const renderProbe = () =>
    render(
        <APIProvider>
            <Probe />
        </APIProvider>
    );

const jsonResponse = (body: unknown) =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response);

const categories = [
    { id: 20, name: "Einsätze", slug: "einsatze", parent: 0, description: "", meta: {} },
    { id: 21, name: "Brandeinsatz", slug: "brandeinsatz", parent: 20, description: "", meta: { kind: "einsatz" } },
    { id: 22, name: "Technischer Einsatz", slug: "technisch", parent: 20, description: "", meta: { kind: "einsatz" } },
    { id: 23, name: "Übung", slug: "uebung", parent: 20, description: "", meta: { kind: "taetigkeit" } },
];

const wpPost = (id: number, title: string, categoryIds: number[]) => ({
    id,
    title: { rendered: title },
    content: { rendered: "<p>Bericht</p>" },
    excerpt: { rendered: "<p>Kurz</p>" },
    categories: categoryIds,
    date: "2025-03-18T10:00:00",
    featured_media: 0,
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe("APIProvider", () => {
    it("zeigt einen Fehler an, statt still eine leere Seite zu rendern", async () => {
        // Genau der Produktionsfall: der Host antwortet mit 404.
        jest.spyOn(global, "fetch").mockResolvedValue({
            ok: false,
            status: 404,
            json: () => Promise.resolve({}),
        } as Response);

        renderProbe();

        await screen.findByText(/fehler:/i);
    });

    it("bricht nicht ab, wenn eine Kategorie fehlt", async () => {
        jest.spyOn(global, "fetch").mockImplementation((input) => {
            const url = String(input);
            if (url.includes("/categories")) return jsonResponse([]);
            return jsonResponse([]);
        });

        renderProbe();

        // Fehlt "einsatze", erscheint ein Hinweis - kein weisser Bildschirm.
        await screen.findByText(/fehler:/i);
    });

    it("ordnet jedem Einsatz seine eigene Einsatzart zu", async () => {
        jest.spyOn(global, "fetch").mockImplementation((input) => {
            const url = String(input);
            if (url.includes("/categories")) return jsonResponse(categories);
            if (url.includes("/posts")) {
                return jsonResponse([
                    wpPost(1, "Brand Wohnhaus", [21]),
                    wpPost(2, "Ölspur", [22]),
                ]);
            }
            return jsonResponse([]);
        });

        renderProbe();

        // Regressionstest: vorher bekamen beide Eintraege dieselbe Art.
        await screen.findByText(/Brand Wohnhaus \| Brandeinsatz/);
        expect(screen.getByText(/Ölspur \| Technischer Einsatz/)).toBeInTheDocument();
    });

    it("leitet Einsatz und Taetigkeit aus der Kategorie ab", async () => {
        jest.spyOn(global, "fetch").mockImplementation((input) => {
            const url = String(input);
            if (url.includes("/categories")) return jsonResponse(categories);
            if (url.includes("/posts")) {
                return jsonResponse([
                    wpPost(1, "Kaminbrand", [21]),
                    wpPost(2, "Abschnittsübung", [23]),
                    wpPost(3, "Ohne Zuordnung", []),
                ]);
            }
            return jsonResponse([]);
        });

        renderProbe();

        await screen.findByText(/Kaminbrand \| Brandeinsatz \| einsatz/);
        expect(screen.getByText(/Abschnittsübung \| Übung \| taetigkeit/)).toBeInTheDocument();
        // Ohne zugeordnete Art zaehlt der Beitrag nicht als Einsatz.
        expect(screen.getByText(/Ohne Zuordnung \| ohne Art \| taetigkeit/)).toBeInTheDocument();
    });
});
