/**
 * author: simon
 * date: 29.11.2024
 * project: ffhausmannstaetten
 * package_name:
 **/
import {ICategory} from "../models/ICategory";
import {IPost} from "../models/IPost";

const BASE_URL = "http://ff-hausmann.bplaced.net/index.php/wp-json/wp/v2";


export const fetchCategories = async (): Promise<ICategory[]> => {
    const response = await fetch(`${BASE_URL}/categories`);
    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }
    const data: any[] = await response.json();
    return data.map(({ id, name,slug,parent,description }) => ({ id, name, slug, parent, description}));
};

export const getRenderedImage = async (mediaId: number): Promise<string> => {
    const response = await fetch(`${BASE_URL}/media/${mediaId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch media");
    }
    const data: any = await response.json();
    return data.guid.rendered;
}


export const fetchPostsByCategory = async (categoryId: number): Promise<IPost[]> => {
    const response = await fetch(`${BASE_URL}/posts?categories=${categoryId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch posts");
    }
    const data: any[] = await response.json();
    console.log(data)
    return data.map((post) => ({
        id: post.id,
        title: post.title.rendered,
        content: post.content.rendered,
        categories: post.categories,
        date:post.date,
        excerpt:post.excerpt.rendered,
        featured_media:post.featured_media
    }));
};
