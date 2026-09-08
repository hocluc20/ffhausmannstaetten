import React, { useEffect, useState } from 'react';
import { Box, Button, Link, Paper, Slide, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const STORAGE_KEY = 'ffh:storage-consent';

/**
 * Hinweis zur lokalen Speicherung.
 *
 * Bewusst kein modaler Dialog mehr: der alte Dialog hat die Seite blockiert
 * und bot nur "Akzeptieren" - eine Ablehnung muss aber genauso einfach
 * moeglich sein. Ausserdem setzt die Seite keine Cookies, sondern nutzt
 * ausschliesslich localStorage fuer Anzeigeeinstellungen.
 */
const CookiePopup: React.FC = () => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        try {
            if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
        } catch {
            // Privater Modus o. Ae.: dann eben kein Hinweis.
        }
    }, []);

    const decide = (value: 'accepted' | 'declined') => () => {
        try {
            localStorage.setItem(STORAGE_KEY, value);
            if (value === 'declined') {
                // Nicht notwendige Einstellungen wieder entfernen.
                localStorage.removeItem('popupClosed');
            }
        } catch {
            // Speicherung nicht moeglich - Hinweis trotzdem schliessen.
        }
        setOpen(false);
    };

    if (!open) return null;

    return (
        <Slide direction="up" in={open} mountOnEnter unmountOnExit>
            <Paper
                elevation={8}
                role="region"
                aria-label="Hinweis zur Datenspeicherung"
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1400,
                    p: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'stretch', md: 'center' },
                    gap: 2,
                    borderRadius: 0,
                }}
            >
                <Typography variant="body2" sx={{ flex: 1 }}>
                    Diese Seite speichert kleine Angaben lokal in Ihrem Browser (zum Beispiel, ob
                    Sie diesen Hinweis bereits gesehen haben). Es werden keine Cookies gesetzt und
                    keine Daten an Dritte übertragen. Näheres in der{' '}
                    <Link component={RouterLink} to="/impressum">
                        Datenschutzerklärung
                    </Link>
                    .
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button onClick={decide('declined')} color="inherit" variant="outlined">
                        Ablehnen
                    </Button>
                    <Button onClick={decide('accepted')} variant="contained">
                        Einverstanden
                    </Button>
                </Box>
            </Paper>
        </Slide>
    );
};

export default CookiePopup;
