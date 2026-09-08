import React from "react";
import {
    Box,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { IType } from "../../common/models/IType";
import { OperationKind } from "../../common/models/ICategory";
import { KIND_LABEL_PLURAL } from "./KindBadge";

export type KindFilter = "alle" | OperationKind;

export interface OperationFilterValue {
    kind: KindFilter;
    typeId: number | "alle";
    search: string;
}

export const EMPTY_FILTER: OperationFilterValue = {
    kind: "alle",
    typeId: "alle",
    search: "",
};

interface OperationFilterProps {
    value: OperationFilterValue;
    onChange: (next: OperationFilterValue) => void;
    /** Alle gepflegten Arten - kommt aus dem Adminbereich. */
    types: IType[];
    /** Wie viele Einträge die aktuelle Auswahl übrig lässt. */
    resultCount: number;
    totalCount: number;
}

const KIND_TABS: { value: KindFilter; label: string }[] = [
    { value: "alle", label: "Alle" },
    { value: "einsatz", label: KIND_LABEL_PLURAL.einsatz },
    { value: "taetigkeit", label: KIND_LABEL_PLURAL.taetigkeit },
];

/**
 * Filterleiste für Einsätze und Tätigkeiten.
 *
 * Beides steht bewusst in einer gemeinsamen Liste statt auf getrennten
 * Seiten: die Chronik der Wehr liest sich zusammenhängend, und wer nur
 * Einsätze sehen will, schaltet mit einem Klick um. Die Arten stammen aus
 * dem Adminbereich - kommt eine neue dazu, erscheint sie hier von selbst.
 */
const OperationFilter: React.FC<OperationFilterProps> = ({
    value,
    onChange,
    types,
    resultCount,
    totalCount,
}) => {
    const set = (patch: Partial<OperationFilterValue>) => onChange({ ...value, ...patch });

    // Wird auf „Einsätze“ umgeschaltet, darf keine Tätigkeitsart ausgewählt
    // bleiben - sonst bliebe die Liste ohne erkennbaren Grund leer.
    const selectKind = (kind: KindFilter) => {
        const stillValid =
            value.typeId === "alle" ||
            kind === "alle" ||
            types.find((type) => type.id === value.typeId)?.kind === kind;
        set({ kind, typeId: stillValid ? value.typeId : "alle" });
    };

    const visibleTypes = types.filter((type) => value.kind === "alle" || type.kind === value.kind);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mb: { xs: 3, md: 4 },
                p: { xs: 2, md: 2.5 },
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "rgba(255,255,255,.75)",
                backdropFilter: "blur(4px)",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                }}
            >
                {/* Umschalter Einsatz / Tätigkeit */}
                <Box
                    role="group"
                    aria-label="Nach Art filtern"
                    sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                >
                    {KIND_TABS.map((tab) => {
                        const active = value.kind === tab.value;
                        return (
                            <Chip
                                key={tab.value}
                                label={tab.label}
                                clickable
                                aria-pressed={active}
                                onClick={() => selectKind(tab.value)}
                                sx={{
                                    px: 0.5,
                                    fontSize: "0.95rem",
                                    backgroundColor: active ? "primary.main" : "transparent",
                                    color: active ? "primary.contrastText" : "text.primary",
                                    border: "1px solid",
                                    borderColor: active ? "primary.main" : "divider",
                                    "&:hover": {
                                        backgroundColor: active ? "primary.dark" : "action.hover",
                                    },
                                }}
                            />
                        );
                    })}
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {resultCount === totalCount
                        ? `${totalCount} Einträge`
                        : `${resultCount} von ${totalCount} Einträgen`}
                </Typography>
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                }}
            >
                <TextField
                    label="Suchen"
                    size="small"
                    value={value.search}
                    onChange={(event) => set({ search: event.target.value })}
                    InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
                />

                <FormControl size="small">
                    <InputLabel id="type-filter-label">Art</InputLabel>
                    <Select
                        labelId="type-filter-label"
                        label="Art"
                        value={value.typeId}
                        onChange={(event) =>
                            set({
                                typeId:
                                    event.target.value === "alle" ? "alle" : Number(event.target.value),
                            })
                        }
                    >
                        <MenuItem value="alle">Alle Arten</MenuItem>
                        {visibleTypes.map((type) => (
                            <MenuItem key={type.id} value={type.id}>
                                {type.name_short}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        </Box>
    );
};

export default OperationFilter;
