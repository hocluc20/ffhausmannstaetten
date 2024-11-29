/**
 * author: simon
 * date: 29.11.2024
 * project: ffhausmannstaetten
 * package_name:
 **/

const BASE_URL = "http://ff-hausmann.bplaced.net/index.php/wp-json/wp/v2";

export interface Category {
    id: number;
    name: string;
}

export interface Post {
    id: number;
    title: string;
    content: string;
    categoryId: number;
}

export const fetchCategories = async (): Promise<Category[]> => {
    const response = await fetch(`${BASE_URL}/categories`);
    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }
    const data: any[] = await response.json();
    return data.map(({ id, name }) => ({ id, name }));
};


export const fetchPostsByCategory = async (categoryId: number): Promise<Post[]> => {
    const response = await fetch(`${BASE_URL}/posts?categories=${categoryId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch posts");
    }
    const data: any[] = await response.json();
    return data.map((post) => ({
        id: post.id,
        title: post.title.rendered,
        content: post.content.rendered,
        categoryId,
    }));
};
