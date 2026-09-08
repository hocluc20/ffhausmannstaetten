import React from "react";
import { Box, SxProps, Theme } from "@mui/material";
import { IVehiclePhoto } from "../../common/models/IVehicleDetail";

interface VehicleImageProps {
    photo?: IVehiclePhoto;
    alt: string;
    sx?: SxProps<Theme>;
    loading?: "eager" | "lazy";
}

/**
 * Fahrzeugbild.
 *
 * Die mitgelieferten Bilder gibt es als WebP mit PNG als Rückfallebene, aus
 * dem Backend kommt nur eine URL. Beides läuft durch dieselbe Komponente,
 * damit die Ansichten sich darum nicht kümmern müssen.
 *
 * Kein `decoding="async"`: auf animierten Ebenen wird das Bild damit unter
 * Umständen gar nicht gezeichnet.
 */
const VehicleImage: React.FC<VehicleImageProps> = ({ photo, alt, sx, loading = "lazy" }) => {
    if (!photo) return null;

    const image = (
        <Box
            component="img"
            src={photo.fallbackUrl ?? photo.url}
            alt={alt}
            loading={loading}
            sx={{ display: "block", ...sx }}
        />
    );

    // Ohne Rückfallebene reicht ein schlichtes <img>.
    if (!photo.fallbackUrl) {
        return (
            <Box
                component="img"
                src={photo.url}
                alt={alt}
                loading={loading}
                sx={{ display: "block", ...sx }}
            />
        );
    }

    return (
        <picture>
            <source srcSet={photo.url} type="image/webp" />
            {image}
        </picture>
    );
};

export default VehicleImage;
