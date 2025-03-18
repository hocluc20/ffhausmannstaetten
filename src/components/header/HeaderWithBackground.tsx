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
                // clipPath: "polygon(35% 10%, 250% 100%, -70% 100%)",
                boxShadow: "-webkit-box-shadow: inset 0px 0px 14px 3px rgba(0,0,0,0.74);-moz-box-shadow: inset 0px 0px 14px 3px rgba(0,0,0,0.74);box-shadow: inset 0px 0px 14px 3px rgba(0,0,0,0.74);"
            }}
        >
            <Typography variant={headerSize as any} sx={{ color: "#b32b2b", fontWeight: "700" }}>
                {headerText}
            </Typography>
        </Box>
    );
};

export default HeaderWithBackground;

