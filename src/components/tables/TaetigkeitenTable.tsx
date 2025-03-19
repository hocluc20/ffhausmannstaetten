import {
    Box, Button,
    FormControl,
    InputLabel, MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TextField
} from '@mui/material';
import React, {useState} from 'react';
import { Link } from 'react-router-dom';

interface taetProps {
    taetigkeiten: ITaetigkeit[];
}
const TaetigkeitenTable: React.FC<taetProps> = ({taetigkeiten}) => {
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [orderBy, setOrderBy] = useState<string>('date');
    const [filterText, setFilterText] = useState<string>('');
    const [monthFilter, setMonthFilter] = useState<string>('Alle');
    const [alarmFilter, setAlarmFilter] = useState<string>('Alle');

    const handleRequestSort = (property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterText(event.target.value as string);
    };

    const handleMonthFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMonthFilter(event.target.value as string);
    };

    const handleAlarmFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAlarmFilter(event.target.value as string);
    };

    const filteredTaetigkeiten = taetigkeiten.filter(taetigkeit => {
        const matchesTextFilter = Object.values(taetigkeit).some(val =>
            val.toString().toLowerCase().includes(filterText.toLowerCase())
        );

        const matchesAlarmFilter = alarmFilter.includes("Alle") || taetigkeit.alarmstichwort.toLowerCase().includes(alarmFilter.toLowerCase());

        let matchesMonthFilter = true;
        if (monthFilter) {
            const dateParts = taetigkeit.date.split(' ');
            const monthString = dateParts[1];
            const year = dateParts[2];

            const monthMap: { [key: string]: string } = {
                Januar: '01',
                Februar: '02',
                März: '03',
                April: '04',
                Mai: '05',
                Juni: '06',
                Juli: '07',
                August: '08',
                September: '09',
                Oktober: '10',
                November: '11',
                Dezember: '12',
            };
            const month = monthMap[monthString];

            matchesMonthFilter = (`${month}/${year}` === monthFilter) || (monthFilter === "Alle");
        }

        return matchesTextFilter && matchesAlarmFilter && matchesMonthFilter;
    });

    const sortData = (array: ITaetigkeit[]) => {
        return array.sort((a, b) => {
            if (orderBy === 'date') {
                const parseDate = (dateString: string): Date => {
                    const dateParts = dateString.split(' '); // z.B. ["18.", "März", "2025"]
                    const day = parseInt(dateParts[0].replace('.', '').trim(), 10); // Tag extrahieren
                    const monthString = dateParts[1]; // Monat extrahieren
                    const year = parseInt(dateParts[2], 10); // Jahr extrahieren

                    const monthMap: { [key: string]: number } = {
                        Januar: 0,
                        Februar: 1,
                        März: 2,
                        April: 3,
                        Mai: 4,
                        Juni: 5,
                        Juli: 6,
                        August: 7,
                        September: 8,
                        Oktober: 9,
                        November: 10,
                        Dezember: 11,
                    };
                    const month = monthMap[monthString];

                    // Rückgabe eines Date-Objekts
                    return new Date(year, month, day);
                };

                const dateA = parseDate(a.date);
                const dateB = parseDate(b.date);

                return order === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
            }
            const propA = a[orderBy].toString().toLowerCase();
            const propB = b[orderBy].toString().toLowerCase();
            return order === 'asc' ? propA.localeCompare(propB) : propB.localeCompare(propA);
        });
    };

    const sortedTaetigkeiten = sortData(filteredTaetigkeiten);

    const monthsAndYears = Array.from(new Set(taetigkeiten.map((taetigkeit) => {
        const dateParts = taetigkeit.date.split(' ');
        const monthString = dateParts[1];
        const year = dateParts[2];

        const monthMap: { [key: string]: string } = {
            Januar: '01',
            Februar: '02',
            März: '03',
            April: '04',
            Mai: '05',
            Juni: '06',
            Juli: '07',
            August: '08',
            September: '09',
            Oktober: '10',
            November: '11',
            Dezember: '12',
        };
        const month = monthMap[monthString];

        return `${month}/${year}`;
    })));

    monthsAndYears.unshift("Alle")

    const alarmStichwoerter = Array.from(new Set(taetigkeiten.map((taetigkeit) => taetigkeit.alarmstichwort)));
    alarmStichwoerter.unshift("Alle")

    return (
        <>
            <Box sx={{textAlign: "center"}}>
                <TextField
                    label="Nach Tätigkeiten suchen"
                    variant="outlined"
                    fullWidth
                    value={filterText}
                    onChange={handleSearchChange}
                    sx={{
                        marginBottom: '20px',
                        maxWidth: 1000,
                        margin: '20px auto',
                        padding: '10px',
                        color: "#000000",
                        borderColor: '#444444',
                        borderWidth: 1,
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: '#444444',
                            },
                            '& input': {
                                color: '#000000',
                            },
                        }
                    }}
                />
            </Box>
            <Box sx={{textAlign: "center"}}>
                <FormControl fullWidth
                             sx={{
                                 marginBottom: '20px',
                                 maxWidth: 500,
                                 margin: '20px auto',
                                 padding: '10px',
                                 color: "#000000",
                                 borderColor: '#444444',
                                 borderWidth: 1,
                                 '& .MuiOutlinedInput-root': {
                                     '& fieldset': {
                                         borderColor: '#444444',
                                     }
                                 }
                             }}>
                    <InputLabel>Alarmstichwort filtern</InputLabel>
                    <Select
                        value={alarmFilter}
                        onChange={handleAlarmFilterChange}
                        label="Alarmstichwort filtern"
                        sx={{color: "#000000"}}
                    >
                        {alarmStichwoerter.map((alarm, index) => (
                            <MenuItem key={index} value={alarm} sx={{color: "#000000"}}>
                                {alarm}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth
                             sx={{
                                 marginBottom: '20px',
                                 maxWidth: 500,
                                 margin: '20px auto',
                                 padding: '10px',
                                 color: "#000000",
                                 borderColor: '#444444',
                                 borderWidth: 1,
                                 '& .MuiOutlinedInput-root': {
                                     '& fieldset': {
                                         borderColor: '#444444',
                                     }
                                 }
                             }}>
                    <InputLabel>Datum filtern</InputLabel>
                    <Select
                        value={monthFilter}
                        onChange={handleMonthFilterChange}
                        label="Monat filtern (MM/YYYY)"
                        sx={{color: "#000000"}}
                    >
                        {monthsAndYears.map((monthYear, index) => (
                            <MenuItem key={index} value={monthYear} sx={{color: "#000000"}}>
                                {monthYear}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <TableContainer component={Paper} sx={{maxWidth: 1000, margin: '20px auto', padding: '10px'}}>
                <Table sx={{minWidth: 650}}>
                    <TableHead>
                        <TableRow sx={{backgroundColor: '#b32b2b', color: '#ffffff'}}>
                            <TableCell sx={{fontWeight: 'bold', color: '#ffffff'}}>
                                <TableSortLabel
                                    active={orderBy === 'alarmstichwort'}
                                    direction={orderBy === 'alarmstichwort' ? order : 'asc'}
                                    onClick={() => handleRequestSort('alarmstichwort')}
                                >
                                    Alarmstichwort
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{fontWeight: 'bold', color: '#ffffff'}}>
                                <TableSortLabel
                                    active={orderBy === 'alarmtitelStichwort'}
                                    direction={orderBy === 'alarmtitelStichwort' ? order : 'asc'}
                                    onClick={() => handleRequestSort('alarmtitelStichwort')}
                                >
                                    Alarmtitel Stichwort
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{fontWeight: 'bold', color: '#ffffff'}}>
                                <TableSortLabel
                                    active={orderBy === 'title'}
                                    direction={orderBy === 'title' ? order : 'asc'}
                                    onClick={() => handleRequestSort('title')}
                                >
                                    Titel
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{fontWeight: 'bold', color: '#ffffff'}}>
                                <TableSortLabel
                                    active={orderBy === 'date'}
                                    direction={orderBy === 'date' ? order : 'asc'}
                                    onClick={() => handleRequestSort('date')}
                                >
                                    Datum
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{fontWeight: 'bold', color: '#ffffff'}}>Zeiten</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedTaetigkeiten.map((taetigkeit, index) => (
                            <TableRow
                                key={index}
                                color={"#000000"}
                                sx={{
                                    '&:nth-of-type(odd)': {
                                        backgroundColor: '#f7f7f7',
                                    },
                                    '&:nth-of-type(even)': {
                                        backgroundColor: 'transparent',
                                    },
                                    '& td': {
                                        color: '#000000',
                                    },
                                    '&:hover': {
                                        backgroundColor: '#d35c5c',
                                        '& td': {
                                            color: '#ffffff',
                                        },
                                    },
                                }}
                            >
                                <TableCell>{taetigkeit.alarmstichwort}</TableCell>
                                <TableCell>{taetigkeit.alarmtitelStichwort}</TableCell>
                                <TableCell>{taetigkeit.title}</TableCell>
                                <TableCell>{taetigkeit.date}</TableCell>
                                <TableCell>
                                    {taetigkeit.startZeit} bis {taetigkeit.endeZeit} Uhr
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        component={Link}
                                        to={`/taetigkeit/${taetigkeit.id}`}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default TaetigkeitenTable;