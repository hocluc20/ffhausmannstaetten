import React, { createContext, useContext, useEffect, useState } from "react";
import {Category, fetchCategories, fetchPostsByCategory, Post} from "../API/BASER_API";


interface APIContextProps {
    categories: Category[];
    getPostsByCategory: (categoryId: number) => Promise<Post[]>;
    isLoading: boolean;
}

const APIContext = createContext<APIContextProps | undefined>(undefined);

export const APIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const postsCache = useState<Map<number, Post[]>>(new Map())[0];

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (categories.length === 0) loadCategories();
    }, [categories]);

    const getPostsByCategory = async (categoryId: number): Promise<Post[]> => {
        if (postsCache.has(categoryId)) {
            return postsCache.get(categoryId)!;
        }

        try {
            const posts = await fetchPostsByCategory(categoryId);
            postsCache.set(categoryId, posts);
            return posts;
        } catch (error) {
            console.error("Error fetching posts:", error);
            return [];
        }
    };

    return (
        <APIContext.Provider value={{ categories, getPostsByCategory, isLoading }}>
            {children}
        </APIContext.Provider>
    );
};

export const useAPI = (): APIContextProps => {
    const context = useContext(APIContext);
    if (!context) {
        throw new Error("useAPI must be used within an APIProvider");
    }
    return context;
};
