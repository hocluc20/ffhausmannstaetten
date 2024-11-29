import React from 'react';
import {Box, Typography, Grid, Divider, Paper, useTheme} from '@mui/material';
import ProfileCard from '../../components/mitglieder/ProfileCard';

const groupedMembers = {
    Kommando: [
        { id: 1, name: 'Max Mustermann', rank: 'Hauptbrandmeister', function: 'Kommandant' },
        { id: 2, name: 'Anna Müller', rank: 'Oberbrandmeisterin', function: 'Stv. Kommandantin' },
    ],
    Zugskommandanten: [
        { id: 3, name: 'Lukas Weber', rank: 'Zugskommandant', function: 'Zug 1' },
        { id: 4, name: 'Petra Schmidt', rank: 'Zugskommandantin', function: 'Zug 2' },
        { id: 5, name: 'Johann Meier', rank: 'Zugskommandant', function: 'Zug 3' },
    ],
    Gruppenkommandanten: [
        { id: 6, name: 'Sophia Klein', rank: 'Gruppenkommandantin', function: 'Gruppe 1' },
        { id: 7, name: 'Paul Neumann', rank: 'Gruppenkommandant', function: 'Gruppe 2' },
        { id: 8, name: 'Clara Fischer', rank: 'Gruppenkommandantin', function: 'Gruppe 3' },
        { id: 8, name: 'Clara Fischer', rank: 'Gruppenkommandantin', function: 'Gruppe 3' },
        { id: 8, name: 'Clara Fischer', rank: 'Gruppenkommandantin', function: 'Gruppe 3' },
        { id: 8, name: 'Clara Fischer', rank: 'Gruppenkommandantin', function: 'Gruppe 3' },
        { id: 8, name: 'Clara Fischer', rank: 'Gruppenkommandantin', function: 'Gruppe 3' },
        { id: 8, name: 'Clara Fischer', rank: 'Gruppenkommandantin', function: 'Gruppe 3' },
    ],
    Verwaltung: [
        { id: 14, name: 'Emma Kaiser', rank: 'Sachbearbeiterin', function: 'Verwaltung' },
        { id: 15, name: 'Jonas Koch', rank: 'Sachbearbeiter', function: 'Verwaltung' },
    ],
    Mannschaft: [
        { id: 16, name: 'Felix Richter', rank: 'Feuerwehrmann', function: 'Einsatzkraft' },
        { id: 17, name: 'Mia Beck', rank: 'Feuerwehrfrau', function: 'Einsatzkraft' },
        { id: 18, name: 'Lara Bauer', rank: 'Feuerwehrfrau', function: 'Einsatzkraft' },
        { id: 18, name: 'Lara Bauer', rank: 'Feuerwehrfrau', function: 'Einsatzkraft' },
        { id: 18, name: 'Lara Bauer', rank: 'Feuerwehrfrau', function: 'Einsatzkraft' },
        { id: 18, name: 'Lara Bauer', rank: 'Feuerwehrfrau', function: 'Einsatzkraft' },
        { id: 18, name: 'Lara Bauer', rank: 'Feuerwehrfrau', function: 'Einsatzkraft' },
        { id: 18, name: 'Lara Bauer', rank: 'Feuerwehrfrau', function: 'Einsatzkraft' },
        { id: 18, name: 'Lara Bauer', rank: 'Feuerwehrfrau', function: 'Einsatzkraft' },
        { id: 18, name: 'Lara Bauer', rank: 'Feuerwehrfrau', function: 'Einsatzkraft' },
        { id: 18, name: 'Lara Bauer', rank: 'Feuerwehrfrau', function: 'Einsatzkraft' },
        { id: 18, name: 'Lara Bauer', rank: 'Feuerwehrfrau', function: 'Einsatzkraft' },
        { id: 18, name: 'Lara Bauer', rank: 'Feuerwehrfrau', function: 'Einsatzkraft' },
        { id: 18, name: 'Lara Bauer', rank: 'Feuerwehrfrau', function: 'Einsatzkraft' },
        { id: 18, name: 'Lara Bauer', rank: 'Feuerwehrfrau', function: 'Einsatzkraft' },
        { id: 18, name: 'Lara Bauer', rank: 'Feuerwehrfrau', function: 'Einsatzkraft' },
        { id: 18, name: 'Lara Bauer', rank: 'Feuerwehrfrau', function: 'Einsatzkraft' },
    ],
};

const Mitglieder: React.FC = () => {
    const theme = useTheme();
    return (
        <Paper
            sx={{
                backgroundColor: '#f9f9f9',
                padding: '2rem',
                borderRadius: 2,
                textAlign: 'center',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            elevation={1}
        >
            {Object.entries(groupedMembers).map(([group, groupMembers]) => (
                <Box key={group} sx={{ mb: 8, width: '100%', marginRight:"250px", marginLeft:"250px", paddingLeft:"7%", paddingRight:"7%" }}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            marginBottom: '1.5rem',
                            textAlign: 'center',
                        }}
                    >
                        {group}
                    </Typography>

                    <Grid container spacing={2} justifyContent="center" sx={{ width: '100%', px: 2 }}>
                        {groupMembers.map((member, index) => {
                            // Berechnen, in welcher Spalte das Mitglied platziert werden soll
                            let gridColumn = (index % 4) + 1; // Spalten 1 bis 4 (4 Mitglieder werden verteilt)

                            return (
                                <Grid
                                    item
                                    xs={6}  // 2 Spalten auf kleinen Bildschirmen
                                    sm={6}  // 2 Spalten auf mittleren Bildschirmen
                                    md={2.4}  // 5 Spalten auf größeren Bildschirmen
                                    key={member.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gridColumn: `span ${gridColumn}` // Anpassung für 4 Spalten
                                    }}
                                >
                                    <ProfileCard
                                        name={member.name}
                                        rank={member.rank}
                                        function={member.function}
                                        imageUrl="/images/feuerwehrMannPlatzhalterKompremiertAuf300px.png"
                                    />
                                </Grid>
                            );
                        })}
                    </Grid>

                    <Divider sx={{ marginTop: '3rem', borderColor: 'rgba(0,0,0,0.1)' }} />
                </Box>
            ))}
        </Paper>

    );
};

export default Mitglieder;
