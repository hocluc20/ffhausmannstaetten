/**
 * author: simon
 * date: 19.03.2025
 * project: ffhausmannstaetten
 * package_name:
 **/

import React from 'react';
import { Box, Typography } from '@mui/material';
import {height} from "@mui/system";

const HeaderWithBackgroundUrl: React.FC<{ headerText: string, headerSize: string, imageName: string, polygon?:string, heightInRem?:number }> = ({ headerText, headerSize, imageName, polygon, heightInRem }) => {
    // Header size: h1-h6
    return (
        <Box
            sx={{
                backgroundImage: `url("${imageName}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "fixed",
                height: heightInRem ? heightInRem+"rem": "15rem",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                // polygon(30% 0%, 124% 33%, 114% 62%, 68% 99%, -3% 83%, -8% 15%)
                clipPath: polygon ? polygon : "",
                boxShadow: "-webkit-box-shadow: inset 0px 0px 14px 3px rgba(0,0,0,0.74);-moz-box-shadow: inset 0px 0px 14px 3px rgba(0,0,0,0.74);box-shadow: inset 0px 0px 14px 3px rgba(0,0,0,0.74);"
            }}
        >
            <Typography variant={headerSize as any} sx={{ color: "#b32b2b", fontWeight: "700" }}>
                {headerText}
            </Typography>
        </Box>
    );
};

export default HeaderWithBackgroundUrl;

