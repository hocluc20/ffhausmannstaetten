import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Typography,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IOperation } from "../../common/models/IOperation";
import KindBadge from "../operations/KindBadge";

interface TaetigkeitenTableProps {
    taetigkeiten: IOperation[];
}

type SortKey = 'type' | 'title' | 'date';

const ALL = 'Alle';

const dateFormatter = new Intl.DateTimeFormat('de-AT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
});

/** Sortierschluessel MM/YYYY, damit die Auswahl chronologisch bleibt. */
const monthKey = (date: Date) =>
    `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

const TaetigkeitenTable: React.FC<TaetigkeitenTableProps> = ({ taetigkeiten }) => {
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [orderBy, setOrderBy] = useState<SortKey>('date');
    const [monthFilter, setMonthFilter] = useState(ALL);

    const handleRequestSort = (property: SortKey) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const monthsAndYears = useMemo(() => {
        const keys = Array.from(new Set(taetigkeiten.map((t) => monthKey(t.date))));
        keys.sort((a, b) => {
            const [ma, ya] = a.split('/');
            const [mb, yb] = b.split('/');
            return `${yb}${mb}`.localeCompare(`${ya}${ma}`);
        });
        return [ALL, ...keys];
    }, [taetigkeiten]);

    const visible = useMemo(() => {
        // Suche und Art filtert bereits die Leiste ueber der Tabelle; hier
        // bleibt nur der Zeitraum, den es dort nicht gibt.
        const filtered = taetigkeiten.filter(
            (operation) => monthFilter === ALL || monthKey(operation.date) === monthFilter
        );

        // Kopie sortieren, damit die Liste aus dem Context unveraendert bleibt.
        return [...filtered].sort((a, b) => {
            if (orderBy === 'date') {
                const diff = a.date.getTime() - b.date.getTime();
                return order === 'asc' ? diff : -diff;
            }
            const valueA = (orderBy === 'type' ? a.type?.name_short ?? '' : a.title).toLowerCase();
            const valueB = (orderBy === 'type' ? b.type?.name_short ?? '' : b.title).toLowerCase();
            return order === 'asc'
                ? valueA.localeCompare(valueB, 'de')
                : valueB.localeCompare(valueA, 'de');
        });
    }, [taetigkeiten, monthFilter, order, orderBy]);

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    justifyContent: 'center',
                    px: 2,
                    mb: 2,
                }}
            >
                <FormControl size="small" sx={{ minWidth: 240, flex: '1 1 240px', maxWidth: 400 }}>
                    <InputLabel id="month-filter-label">Datum filtern</InputLabel>
                    <Select
                        labelId="month-filter-label"
                        value={monthFilter}
                        onChange={(event) => setMonthFilter(event.target.value)}
                        label="Datum filtern"
                    >
                        {monthsAndYears.map((monthYear) => (
                            <MenuItem key={monthYear} value={monthYear}>
                                {monthYear}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <TableContainer
                component={Paper}
                sx={{ maxWidth: 1000, margin: '20px auto', overflowX: 'auto' }}
            >
                <Table sx={{ minWidth: 650 }} aria-label="Liste der Tätigkeiten">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#b32b2b' }}>
                            {([
                                { key: 'type' as SortKey, label: 'Art' },
                                { key: 'title' as SortKey, label: 'Titel' },
                                { key: 'date' as SortKey, label: 'Datum' },
                            ]).map((column) => (
                                <TableCell key={column.key} sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                                    <TableSortLabel
                                        active={orderBy === column.key}
                                        direction={orderBy === column.key ? order : 'asc'}
                                        onClick={() => handleRequestSort(column.key)}
                                        sx={{
                                            color: '#ffffff !important',
                                            '& .MuiTableSortLabel-icon': { color: '#ffffff !important' },
                                        }}
                                    >
                                        {column.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {visible.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                                        Keine Tätigkeiten gefunden.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            visible.map((operation) => (
                                <TableRow
                                    key={operation.id}
                                    sx={{
                                        '&:nth-of-type(odd)': { backgroundColor: '#f7f7f7' },
                                        '&:hover': { backgroundColor: '#ffeaea' },
                                    }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
                                            <KindBadge kind={operation.kind} />
                                            {operation.type && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {operation.type.name_short}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{operation.title}</TableCell>
                                    <TableCell>{dateFormatter.format(operation.date)}</TableCell>
                                    <TableCell align="right">
                                        <Button
                                            component={Link}
                                            to={`/taetigkeit/${operation.id}`}
                                            variant="outlined"
                                            size="small"
                                        >
                                            Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default TaetigkeitenTable;
