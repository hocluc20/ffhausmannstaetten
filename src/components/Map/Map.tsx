// src/Map.tsx
import React from 'react';
import { Box } from '@mui/material';

const Map: React.FC = () => {
    // Google Maps URL für das Einbetten einer Adresse
    const googleMapUrl = 'https://www.google.com/maps/embed/v1/place?q=Dorfstraße+15,+8071+Hausmannstätten';

    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
            {/* Einbetten der Google Map als iframe */}
            <iframe
                src={googleMapUrl}
                width="100%"
                height="400px"
                style={{ border: '0' }}
                allowFullScreen
                loading="lazy"
                title="Google Map"
            />
        </Box>
    );
};

export default Map;
