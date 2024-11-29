import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import {color, styled} from '@mui/system';

// Hintergrundbild fixiert, bewegt sich nicht mit dem Scrollen
const ScrollableBackground = styled(Box)({
    height: '150px', // Höhe des Hintergrunds
    width: '100%',
    backgroundImage: 'url("/images/FFHausMitAutos.jpg")', // Pfad zu deinem Hintergrundbild
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'fixed', // Fixiert den Hintergrund
    top: 0, // Der Hintergrund bleibt immer oben
    left: 0,
    zIndex: -1, // Der Hintergrund bleibt hinter dem Text
});

// Der Textbereich scrollt mit der Seite
const TransparentHeader = styled(Box)({
    position: 'relative', // Der Text bleibt relativ und scrollt mit
    paddingTop: '150px', // Sicherstellen, dass der Text unter dem Bild bleibt
    zIndex: 1, // Der Text bleibt über dem Hintergrund
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)' // Korrektur: Hintergrundfarbe transparent
});


const HeaderWithBackground: React.FC<{ headerText: string }> = ({ headerText }) => {
    const theme = useTheme();

    return (
        <Box position="relative">
            {/* Fixierter Bereich mit Hintergrundbild */}
            <ScrollableBackground />

            {/* Der Header-Text, der mit der Seite scrollt */}
            <TransparentHeader>
                <Typography variant="h2" sx={{ color: (theme) => theme.palette.primary.main, backgroundColor:'rgba(0,0,0,0)' }}>
                    {headerText}
                </Typography>
            </TransparentHeader>
        </Box>
    );
};

export default HeaderWithBackground;

