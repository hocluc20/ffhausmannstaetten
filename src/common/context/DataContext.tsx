import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {fetchCategories, fetchPostsByCategory, getRenderedImage} from "../API/BASER_API";
import { IOperation } from "../models/IOperation";
import { ICategory } from "../models/ICategory";
import {IPost} from "../models/IPost";
import {
    filterOrganizationsFromCategories, filterPhotosFromContent, filterTextFromContent,
    filterTypeFromCategories,
    filterVehiclesFromCategories
} from "../bl/FilterFunctions";

interface APIContextProps {
    categories: ICategory[];
    getPostsByCategory: (categoryId: number) => Promise<IPost[]>;
    getOperations: () => Promise<IOperation[]>;
    isLoading: boolean;
    operations: IOperation[];
}

const APIContext = createContext<APIContextProps | undefined>(undefined);

export const APIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [operations, setOperations] = useState<IOperation[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // Use a ref for cache so updates do not trigger re-renders
    const postsCache = useRef<Map<number, IPost[]>>(new Map());

    // Helper function to get posts by category id, using the cache
    const getPostsByCategory = async (categoryId: number): Promise<IPost[]> => {
        if (postsCache.current.has(categoryId)) {
            return postsCache.current.get(categoryId)!;
        }
        try {
            const posts = await fetchPostsByCategory(categoryId);
            postsCache.current.set(categoryId, posts);
            return posts;
        } catch (error) {
            console.error("Error fetching posts:", error);
            return [];
        }
    };

    // Combined effect for loading categories and then operations.
    useEffect(() => {
        const loadData = async () => {
            try {
                const fetchedCategories = await fetchCategories();
                setCategories(fetchedCategories);

                // Find the "einsatze" category (change slug as needed)
                const category = fetchedCategories.find(cat => cat.slug === "einsatze");
                if (!category) {
                    console.warn("Category 'einsatze' not found.");
                    return;
                }

                const posts: IPost[] = await getPostsByCategory(category.id);
                const newOperations = await Promise.all(
                    posts.map(async (p) => ({
                        id: p.id,
                        title: p.title,
                        content: filterTextFromContent(p.content).join("\n"),
                        date: new Date(p.date),
                        headline: p.excerpt,
                        headline_image: p.featured_media,
                        organisations: filterOrganizationsFromCategories(fetchedCategories),
                        photos: filterPhotosFromContent(p.content),
                        type: filterTypeFromCategories(fetchedCategories),
                        vehicles: filterVehiclesFromCategories(fetchedCategories),
                        headline_image_rendered: p.featured_media !== 0 && await getRenderedImage(p.featured_media),
                    }))
                );


                setOperations(newOperations);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // getOperations is available to fetch operations on demand if needed
    const getOperations = async (): Promise<IOperation[]> => {
        if (operations.length > 0) return operations;
        if (categories.length === 0) {
            console.warn("Categories not loaded yet.");
            return [];
        }
        const category = categories.find(cat => cat.slug === "einsatze");
        if (!category) {
            console.warn("Category 'einsatze' not found.");
            return [];
        }
        try {
            const posts = await getPostsByCategory(category.id);
            const newOperations = posts.map(p => ({
                id: p.id,
                title: p.title,
                content: p.content,
                date: new Date(),
                headline: "",
                headline_image: 0,
                organisations: [],
                photos: [],
                type: { id: 0, name_short: "", name_long: "" },
                vehicles: []
            }));
            setOperations(newOperations);
            return newOperations;
        } catch (error) {
            console.error("Error fetching operations:", error);
            return [];
        }
    };

    return (
        <APIContext.Provider value={{ categories, getPostsByCategory, getOperations, isLoading, operations }}>
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
