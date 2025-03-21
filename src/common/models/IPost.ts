export interface IPost {
    id: number;
    title: string;
    content: string;
    categories: number[];
    date: Date;
    excerpt: string;
    featured_media:number
}