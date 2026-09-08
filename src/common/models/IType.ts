import { OperationKind } from "./ICategory";

export interface IType {
    id: number,
    name_short: string,
    name_long: string,
    /** Einsatz oder Tätigkeit - steuert Kennzeichnung und Filter. */
    kind: OperationKind,
}
