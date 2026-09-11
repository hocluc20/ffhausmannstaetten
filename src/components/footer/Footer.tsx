import React from "react";
import { Box, Container, Grid, Typography, Link, useTheme } from "@mui/material";
import { Email, Facebook, Instagram, Info, Phone } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

/**
 * Externe Profile der Feuerwehr.
 *
 * Solange hier null steht, wird der Eintrag nicht gerendert - besser kein
 * Link als ein Link, der ins Leere fuehrt. Sobald die Adressen feststehen,
 * einfach eintragen.
 */
const SOCIAL_LINKS: { label: string; href: string | null; icon: React.ReactNode }[] = [
    { label: "Facebook", href: null, icon: <Facebook sx={{ mr: 1 }} /> },
    { label: "Instagram", href: null, icon: <Instagram sx={{ mr: 1 }} /> },
];

const linkSx = {
    display: "flex",
    alignItems: "center",
    mb: 1,
    color: "inherit",
};

const Footer: React.FC = () => {
    const theme = useTheme();
    const availableSocials = SOCIAL_LINKS.filter((entry) => entry.href);

    return (
        <Box
            component="div"
            sx={{
                position: "relative",
                background: "linear-gradient(150deg, #b32b2b 0%, #6d1414 45%, #1a1614 100%)",
                color: "white",
                // Hoehe folgt dem Inhalt: feste Werte haben bei laengeren
                // Texten oder grossen Schriftgraden zu Ueberlauf gefuehrt.
                pt: { xs: 6, md: 10 },
                pb: { xs: 5, md: 7 },
                mt: { xs: 6, md: 10 },
                clipPath: {
                    xs: "none",
                    md: "polygon(0 42px, 100% 0, 100% 100%, 0 100%)",
                },
                // Goldene Oberkante als Abschluss.
                "&::after": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: "4px",
                    background: "linear-gradient(90deg, #ffd700, #b32b2b)",
                },
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4} justifyContent="space-between">
                    {/* Kontaktdaten */}
                    <Grid item xs={12} sm={4}>
                        <Typography
                            variant="h6"
                            component="h2"
                            gutterBottom
                            sx={{
                                borderBottom: `3px solid ${theme.palette.warning.main}`,
                                display: "inline-block",
                                pb: 0.5,
                            }}
                        >
                            KONTAKTDATEN
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Freiwillige Feuerwehr Hausmannstätten
                            <br />
                            Dorfstraße 15
                            <br />
                            8071 Hausmannstätten
                        </Typography>
                        <Link
                            href="mailto:ff.hausmannstaetten@bfvgu.at"
                            underline="hover"
                            sx={{ ...linkSx, mt: 2 }}
                        >
                            <Email sx={{ mr: 1 }} /> ff.hausmannstaetten@bfvgu.at
                        </Link>
                    </Grid>

                    {/* Information */}
                    <Grid item xs={12} sm={4}>
                        <Typography
                            variant="h6"
                            component="h2"
                            gutterBottom
                            sx={{
                                borderBottom: `3px solid ${theme.palette.warning.main}`,
                                display: "inline-block",
                                pb: 0.5,
                            }}
                        >
                            INFORMATION
                        </Typography>
                        <Box component="ul" sx={{ listStyle: "none", pl: 0, mt: 2 }}>
                            <li>
                                <Link component={RouterLink} to="/impressum" underline="hover" sx={linkSx}>
                                    <Info sx={{ mr: 1 }} /> Impressum
                                </Link>
                            </li>
                            <li>
                                <Link component={RouterLink} to="/kontakt" underline="hover" sx={linkSx}>
                                    <Phone sx={{ mr: 1 }} /> Kontakt
                                </Link>
                            </li>
                        </Box>
                    </Grid>

                    {/* Links - nur rendern, wenn Adressen hinterlegt sind */}
                    {availableSocials.length > 0 && (
                        <Grid item xs={12} sm={4}>
                            <Typography
                                variant="h6"
                                component="h2"
                                gutterBottom
                                sx={{
                                    borderBottom: `3px solid ${theme.palette.warning.main}`,
                                    display: "inline-block",
                                    pb: 0.5,
                                }}
                            >
                                LINKS
                            </Typography>
                            <Box component="ul" sx={{ listStyle: "none", pl: 0, mt: 2 }}>
                                {availableSocials.map((entry) => (
                                    <li key={entry.label}>
                                        <Link
                                            href={entry.href as string}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            underline="hover"
                                            sx={linkSx}
                                        >
                                            {entry.icon} {entry.label}
                                        </Link>
                                    </li>
                                ))}
                            </Box>
                        </Grid>
                    )}
                </Grid>

                <Box
                    sx={{
                        textAlign: "center",
                        borderTop: "1px solid rgba(255,255,255,0.25)",
                        mt: 4,
                        pt: 2,
                        color: theme.palette.grey[300],
                    }}
                >
                    <Typography variant="body2">
                        &copy; {new Date().getFullYear()} Freiwillige Feuerwehr Hausmannstätten. Alle
                        Rechte vorbehalten.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
