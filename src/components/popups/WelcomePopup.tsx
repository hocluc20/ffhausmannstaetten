import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Box,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/**
 * Aktuelle Ankuendigung.
 *
 * Der Schluessel enthaelt die Kampagne: vorher wurde ein generisches
 * "popupClosed" gesetzt, wodurch jede spaetere Ankuendigung bei allen
 * Besuchern unterdrueckt blieb, die einmal geschlossen hatten.
 *
 * showFrom/showUntil begrenzen die Laufzeit - das Friedenslicht ist ein
 * Weihnachtsthema und wurde bisher ganzjaehrig angezeigt.
 */
const CAMPAIGN = {
    key: "ffh:popup:friedenslicht-2025",
    image: "/images/Friedenslicht.png",
    webp: "/images/Friedenslicht.webp",
    alt: "Ankündigung: Friedenslicht der Freiwilligen Feuerwehr Hausmannstätten",
    showFrom: new Date("2025-12-01T00:00:00"),
    showUntil: new Date("2025-12-27T00:00:00"),
};

const WelcomePopup: React.FC = () => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
        const now = new Date();
        if (now < CAMPAIGN.showFrom || now >= CAMPAIGN.showUntil) return;

        try {
            if (!localStorage.getItem(CAMPAIGN.key)) setOpen(true);
        } catch {
            // Kein Zugriff auf localStorage - dann keine Ankuendigung zeigen.
        }
    }, []);

    const handleClose = () => {
        try {
            localStorage.setItem(CAMPAIGN.key, "closed");
        } catch {
            // Ignorieren: das Schliessen soll trotzdem funktionieren.
        }
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullScreen={fullScreen}
            maxWidth="sm"
            fullWidth
            aria-labelledby="welcome-popup-title"
        >
            <DialogTitle id="welcome-popup-title" sx={{ pr: 6 }}>
                Aktuelles
                <IconButton
                    onClick={handleClose}
                    aria-label="Ankündigung schließen"
                    sx={{ position: "absolute", right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <picture>
                    <source srcSet={CAMPAIGN.webp} type="image/webp" />
                    <Box
                        component="img"
                        src={CAMPAIGN.image}
                        alt={CAMPAIGN.alt}
                        sx={{ width: "100%", height: "auto", display: "block", borderRadius: 1 }}
                    />
                </picture>
            </DialogContent>
        </Dialog>
    );
};

export default WelcomePopup;
