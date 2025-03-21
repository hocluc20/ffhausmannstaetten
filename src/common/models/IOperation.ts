import {IVehicle} from "./IVehicle";
import {IType} from "./IType";

export interface IOperation {
    id:number,
    title:string,
    headline:string,
    type:IType,
    content:string,
    date:Date,
    organisations:string[],
    vehicles:IVehicle[],
    photos:string[],
    headline_image:number,
    headline_image_rendered?:string,
}