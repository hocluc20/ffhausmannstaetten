import {ICategory} from "../models/ICategory";
import {IVehicle} from "../models/IVehicle";
import {IType} from "../models/IType";

export const filterVehiclesFromCategories = (categories: ICategory[]): IVehicle[] => {
    const vehicleID = categories.filter((category) => category.slug === 'fahrzeuge');
    return categories.filter((category) => category.parent === vehicleID[0].id).map(c => ({
        id: c.id,
        name_long: c.description,
        name_short: c.name
    }))
}

export const filterOrganizationsFromCategories = (categories: ICategory[]): string[] => {
    const organizationID = categories.filter((category) => category.slug === 'einsatzmittel');
    return categories.filter((category) => category.parent === organizationID[0].id).map(c => c.name)
}

export const filterTypeFromCategories = (categories: ICategory[]): IType => {
    const typeID = categories.filter((category) => category.slug === 'einsatze');
    const type = categories.filter((category) => category.parent === typeID[0].id)[0];
    return {
        id: type.id,
        name_long: type.description,
        name_short: type.name
    }
}

export const filterPhotosFromContent = (content: string): string[] => {
    const photoRegex = /<img[^>]+src=["']([^"']+)["']/g;
    const photos: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = photoRegex.exec(content)) !== null) {
        photos.push(match[1]);
    }

    return photos;
};

export const filterTextFromContent = (content: string): string[] => {
    const textRegex = /<(p|pre)[^>]*>(.*?)<\/\1>/gs;
    const extractedText: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = textRegex.exec(content)) !== null) {
        extractedText.push(match[2].replace(/<br\s*\/?>/gi, "\n").trim());
    }

    return extractedText;
};

