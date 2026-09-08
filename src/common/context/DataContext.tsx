import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    fetchCategories,
    fetchMembers,
    fetchPostsByCategory,
    fetchSettings,
    fetchVehicles,
} from "../API/BASER_API";
import {IOperation} from "../models/IOperation";
import {ICategory} from "../models/ICategory";
import {IPost} from "../models/IPost";
import {IType} from "../models/IType";
import {DEFAULT_SETTINGS, ISettings} from "../models/ISettings";
import {IMember} from "../models/IMember";
import {IVehicleDetail} from "../models/IVehicleDetail";
import {
    filterOrganizationsFromCategories,
    filterPhotosFromContent,
    filterTextFromContent,
    filterTypeFromCategories,
    filterVehiclesFromCategories,
    listTypes,
    stripHtml,
} from "../bl/FilterFunctions";

interface APIContextProps {
    categories: ICategory[];
    getPostsByCategory: (categoryId: number) => Promise<IPost[]>;
    isLoading: boolean;
    /** Menschenlesbare Fehlermeldung, wenn das Laden fehlgeschlagen ist. */
    error: string | null;
    /** Erneuter Ladeversuch, z. B. aus einem Fehlerzustand heraus. */
    reload: () => void;
    operations: IOperation[];
    /** Alle gepflegten Einsatz- und Tätigkeitsarten, für Filter und Legende. */
    types: IType[];
    /** Kennzahlen der Startseite. */
    settings: ISettings;
    /** Mannschaft aus dem Adminbereich; leer, wenn der Endpunkt fehlt. */
    members: IMember[];
    /** Fuhrpark aus dem Adminbereich; leer, wenn der Endpunkt fehlt. */
    fleet: IVehicleDetail[];
}

const APIContext = createContext<APIContextProps | undefined>(undefined);

const toOperation = (post: IPost, categories: ICategory[]): IOperation => {
    const type = filterTypeFromCategories(categories, post.categories);
    return {
    id: post.id,
    title: stripHtml(post.title),
    content: filterTextFromContent(post.content).join("\n"),
    date: new Date(post.date),
    headline: stripHtml(post.excerpt),
    headline_image: post.featured_media,
    // Die Filter bekommen jetzt die Kategorien DES BEITRAGS mit, sonst
    // bekommt jeder Einsatz dieselbe Art, dieselben Fahrzeuge und dieselben
    // Organisationen zugewiesen.
    organisations: filterOrganizationsFromCategories(categories, post.categories),
    photos: filterPhotosFromContent(post.content),
    type,
    // Ohne zugeordnete Art gilt der Beitrag als Tätigkeit - so kann ein
    // unvollständig erfasster Eintrag die Einsatzzahl nicht verfälschen.
    kind: type?.kind ?? "taetigkeit",
    vehicles: filterVehiclesFromCategories(categories, post.categories),
    headline_image_rendered: post.featured_media_url,
    };
};

export const APIProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [operations, setOperations] = useState<IOperation[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [settings, setSettings] = useState<ISettings>(DEFAULT_SETTINGS);
    const [members, setMembers] = useState<IMember[]>([]);
    const [fleet, setFleet] = useState<IVehicleDetail[]>([]);
    const [reloadToken, setReloadToken] = useState(0);
    // Cache als ref, damit Aktualisierungen keine Re-Renders auslösen.
    const postsCache = useRef<Map<number, IPost[]>>(new Map());

    const getPostsByCategory = useCallback(async (categoryId: number): Promise<IPost[]> => {
        const cached = postsCache.current.get(categoryId);
        if (cached) return cached;

        const posts = await fetchPostsByCategory(categoryId);
        postsCache.current.set(categoryId, posts);
        return posts;
    }, []);

    const reload = useCallback(() => {
        postsCache.current.clear();
        setReloadToken((token) => token + 1);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Kennzahlen, Mannschaft und Fuhrpark sind fuer den
                // Einsatzbereich unkritisch: schlaegt einer der Abrufe fehl,
                // greifen Standardwerte bzw. die mitgelieferten Listen, und
                // die Seite laedt trotzdem.
                fetchSettings().then((loaded) => {
                    if (!cancelled) setSettings(loaded);
                });
                fetchMembers().then((loaded) => {
                    if (!cancelled) setMembers(loaded);
                });
                fetchVehicles().then((loaded) => {
                    if (!cancelled) setFleet(loaded);
                });

                const fetchedCategories = await fetchCategories();
                if (cancelled) return;
                setCategories(fetchedCategories);

                const category = fetchedCategories.find((cat) => cat.slug === "einsatze");
                if (!category) {
                    if (!cancelled) {
                        setOperations([]);
                        setError(
                            "Die Kategorie „Einsätze“ konnte nicht gefunden werden. " +
                            "Bitte die Kategorien im Redaktionssystem prüfen."
                        );
                    }
                    return;
                }

                const posts = await getPostsByCategory(category.id);
                if (cancelled) return;

                const newOperations = posts
                    .map((post) => toOperation(post, fetchedCategories))
                    .sort((a, b) => b.date.getTime() - a.date.getTime());

                setOperations(newOperations);
            } catch (caught) {
                if (cancelled) return;
                setOperations([]);
                setError(
                    caught instanceof Error
                        ? caught.message
                        : "Die Feuerwehr-Daten konnten nicht geladen werden."
                );
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        loadData();
        return () => {
            cancelled = true;
        };
    }, [getPostsByCategory, reloadToken]);

    // Ohne useMemo bekommt jeder Consumer bei jedem Provider-Render ein neues
    // Objekt und rendert mit, auch wenn sich nichts geändert hat.
    const types = useMemo(() => listTypes(categories), [categories]);

    const value = useMemo(
        () => ({
            categories, getPostsByCategory, isLoading, error, reload,
            operations, types, settings, members, fleet,
        }),
        [
            categories, getPostsByCategory, isLoading, error, reload,
            operations, types, settings, members, fleet,
        ]
    );

    return <APIContext.Provider value={value}>{children}</APIContext.Provider>;
};

export const useAPI = (): APIContextProps => {
    const context = useContext(APIContext);
    if (!context) {
        throw new Error("useAPI must be used within an APIProvider");
    }
    return context;
};
