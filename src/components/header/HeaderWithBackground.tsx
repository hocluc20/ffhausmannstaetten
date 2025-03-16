import React from 'react';
import { Box, Typography } from '@mui/material';

const HeaderWithBackground: React.FC<{ headerText: string, headerSize: string, imageName: string }> = ({ headerText, headerSize, imageName }) => {
    // Header size: h1-h6
    return (
        <Box
            sx={{
                backgroundImage: `url("/images/${imageName}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "fixed",
                height: "15rem",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Typography variant={headerSize as any} sx={{ color: "#b32b2b" }}>
                {headerText}
            </Typography>
        </Box>
    );
};

export default HeaderWithBackground;

