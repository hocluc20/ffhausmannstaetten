export interface IPost {
    id: number;
    title: string;
    content: string;
    categories: number[];
    /** ISO-Datumsstring, wie ihn die WordPress-API liefert. */
    date: string;
    excerpt: string;
    featured_media: number;
    /** Aus der _embed-Antwort aufgelöst; undefined, wenn kein Bild hinterlegt ist. */
    featured_media_url?: string;
}
