// src/Map.tsx
import React from 'react';
import { Box } from '@mui/material';

/**
 * Standortkarte.
 *
 * Verwendet die schluessellose Einbettungsform. Die frueher genutzte
 * maps/embed/v1/place-URL setzt einen API-Key voraus und haette ohne diesen
 * nur eine Fehlermeldung angezeigt.
 *
 * Achtung: Diese Einbettung laedt Ressourcen von Google. Sie sollte erst
 * gerendert werden, wenn die Besucherin bzw. der Besucher zugestimmt hat.
 */
const ADDRESS = 'Dorfstraße 15, 8071 Hausmannstätten, Österreich';

const Map: React.FC = () => {
    const src = `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`;

    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
            <Box
                component="iframe"
                src={src}
                title="Standort der Freiwilligen Feuerwehr Hausmannstätten"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                sx={{ width: '100%', height: 400, border: 0, borderRadius: 1 }}
            />
        </Box>
    );
};

export default Map;
