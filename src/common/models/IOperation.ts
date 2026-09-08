import {IVehicle} from "./IVehicle";
import {IType} from "./IType";
import {OperationKind} from "./ICategory";

export interface IOperation {
    id: number,
    title: string,
    headline: string,
    /** undefined, wenn dem Beitrag keine Einsatzart zugeordnet ist. */
    type?: IType,
    /**
     * Einsatz oder Tätigkeit. Leitet sich aus der Art ab; ohne zugeordnete
     * Art gilt der Beitrag als Tätigkeit, damit er die Einsatzzahl nicht
     * fälschlich erhöht.
     */
    kind: OperationKind,
    content: string,
    date: Date,
    organisations: string[],
    vehicles: IVehicle[],
    photos: string[],
    headline_image: number,
    headline_image_rendered?: string,
}
