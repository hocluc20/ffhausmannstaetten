import React from "react";
import { Chip, ChipProps } from "@mui/material";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import HandymanIcon from "@mui/icons-material/Handyman";
import { OperationKind } from "../../common/models/ICategory";

/**
 * Kennzeichnung Einsatz vs. Tätigkeit.
 *
 * Bewusst nicht nur über die Farbe: Rot/Gold allein wäre für Menschen mit
 * Farbsehschwäche kein Unterschied, deshalb tragen die Abzeichen zusätzlich
 * ein eigenes Symbol und eine eigene Beschriftung.
 */
export const KIND_LABEL: Record<OperationKind, string> = {
    einsatz: "Einsatz",
    taetigkeit: "Tätigkeit",
};

/** Eigene Pluralformen - "Einsatz" + "e" ergaebe "Einsatze". */
export const KIND_LABEL_PLURAL: Record<OperationKind, string> = {
    einsatz: "Einsätze",
    taetigkeit: "Tätigkeiten",
};

const STYLES: Record<OperationKind, { bg: string; fg: string; border: string }> = {
    einsatz: { bg: "#b32b2b", fg: "#ffffff", border: "#8d1f1f" },
    taetigkeit: { bg: "#f4e3a8", fg: "#4a3b0c", border: "#d8b641" },
};

interface KindBadgeProps extends Omit<ChipProps, "label" | "color"> {
    kind: OperationKind;
    /** Zusätzlich die konkrete Art anzeigen, z. B. „Einsatz · Brandeinsatz“. */
    typeName?: string;
    /** Für dunkle Hintergründe (Bildkacheln) etwas kräftiger. */
    contrast?: boolean;
}

const KindBadge: React.FC<KindBadgeProps> = ({
    kind,
    typeName,
    contrast = false,
    size = "small",
    sx,
    ...rest
}) => {
    const style = STYLES[kind];
    const label = typeName ? `${KIND_LABEL[kind]} · ${typeName}` : KIND_LABEL[kind];

    return (
        <Chip
            size={size}
            icon={
                kind === "einsatz"
                    ? <LocalFireDepartmentIcon sx={{ fontSize: "1rem" }} />
                    : <HandymanIcon sx={{ fontSize: "1rem" }} />
            }
            label={label}
            aria-label={label}
            sx={{
                backgroundColor: style.bg,
                color: style.fg,
                border: `1px solid ${style.border}`,
                boxShadow: contrast ? "0 2px 10px rgba(0,0,0,.35)" : "none",
                "& .MuiChip-icon": { color: style.fg, ml: "6px" },
                ...sx,
            }}
            {...rest}
        />
    );
};

export default KindBadge;
