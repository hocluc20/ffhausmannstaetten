import React from 'react';
import {Box, Typography, Grid, Divider, Paper} from '@mui/material';
import ProfileCard from '../../components/mitglieder/ProfileCard';
import HeaderWithBackground from "../../components/header/HeaderWithBackground";

const groupedMembers = {
    Kommando: [
        { id: 1, name: 'HBI Thomas Molidor', rank: 'Hauptbrandinspektor', function: 'Kommandant' },
        { id: 2, name: 'OBI Johannes Lafer', rank: 'Oberbrandinspektor', function: 'Stv. Kommandant' },
    ],
    Zugskommandanten: [
        { id: 3, name: 'BI Robert Zaunschirm', rank: 'Zugskommandant', function: 'Übungsbeauftragter' },
        { id: 4, name: 'HBI a.D. Robert Molidor', rank: 'Zugskommandant', function: 'Katastrophenschutz- \nbeauftragter' },
        { id: 5, name: 'BM Gernot Lukas', rank: 'Zugskommandant', function: 'Kraftfahrerbeauftragter' },
    ],
    Gruppenkommandanten: [
        { id: 6, name: 'OBI a.D. Thomas Maier-Pongratz', rank: 'Gruppenkommandant', function: 'ÖFAST-Beauftragter' },
        { id: 7, name: 'HLM Roland Helm', rank: 'Gruppenkommandant', function: 'MRAS-Beauftragter' },
        { id: 8, name: 'HLM Robert Matzer', rank: 'Gruppenkommandant', function: '' },
        { id: 9, name: 'OLM Martin Pechmann', rank: 'Gruppenkommandant', function: 'Geräte- und Maschinenmeister' },
        { id: 10, name: 'LM Lukas Barrett', rank: 'Gruppenkommandant', function: 'Geräte- und Maschinenmeister' },
        { id: 11, name: 'LM Thomas Lechner', rank: 'Gruppenkommandant, Kassier', function: 'Kassier' },
    ],
    Beauftragte: [
        { id: 12, name: 'LM d.V. Christoph Winkler', rank: 'Verwaltungsbeauftragter', function: 'Schriftführer' },
        { id: 13, name: 'LM d.V. Lukas Hochfellner', rank: 'Verwaltungsbeauftragter', function: 'EDV-Beauftragter' },
        { id: 14, name: 'LM d.F. Fabian Pußwald', rank: 'Fachdienstbeauftragter', function: 'Funkbeauftragter' },
        { id: 15, name: 'OLM d.F. Daniel Laipold', rank: 'Fachdienstbeauftragter', function: 'Küchenbeauftragter' },
        { id: 16, name: 'OLM d.F. Clemens Lafer', rank: 'Fachdienstbeauftragter', function: 'Hydrantenbeauftragter' },
        { id: 17, name: 'LM d.S. Matthias Gfall', rank: 'Sanitätsbeauftragter', function: 'Sanitätsbeauftragter' },
    ]
};

const Mitglieder: React.FC = () => {
    return (
        <Box
            sx={{
                padding: '',
                borderRadius: 2,
                textAlign: 'center',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {Object.entries(groupedMembers).map(([group, groupMembers]) => (
                <>
                    {group === "Kommando" ?
                        <HeaderWithBackground headerText={group} headerSize={"h1"} imageName={"sam_3937.jpg"}/>
                        :
                        <HeaderWithBackground headerText={group} headerSize={"h1"} imageName={"sam_3937.jpg"}/>
                    }


                    <Grid container spacing={2} justifyContent="center" sx={{ width: '100%', px: 2, marginTop: "4vh", marginLeft: "15vh", marginRight:"15vh" }}>
                        {groupMembers.map((member, index) => {
                            let gridColumn = (index % 4) + 1;

                            return (
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={3}
                                    key={member.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gridColumn: `span ${gridColumn}`,
                                        marginRight: "0.5vh",
                                        marginLeft: "0.5vh",
                                        marginBottom: "2vh"
                                    }}
                                >
                                    <ProfileCard
                                        name={member.name}
                                        rank={member.rank}
                                        function={member.function}
                                        imageUrl="/images/IMG_9432.JPG"
                                    />
                                </Grid>
                            );
                        })}
                    </Grid>

                    <Divider sx={{ marginTop: '3rem', borderColor: 'rgba(0,0,0,0.1)' }} />
                </>
            ))}
        </Box>

    );
};

export default Mitglieder;
