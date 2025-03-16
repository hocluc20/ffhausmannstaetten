import React from "react";
import {
    Box,
    Container,
    Grid,
    Typography,
    Link,
    useTheme,
} from "@mui/material";
import { Email, Facebook, Instagram, Info, Phone } from "@mui/icons-material";

const Footer: React.FC = () => {
    const theme = useTheme();

    return (
        <Box
            component="footer"
            sx={{
                background: `linear-gradient(135deg, #b32b2b, #000000)`,
                color: "white",
                py: 4,
            }}
        >
            <Container maxWidth="lg">
                {/* Footer Sections */}
                <Grid container spacing={4} justifyContent="space-between">
                    {/* Section: Kontaktdaten */}
                    <Grid item xs={12} sm={4}>
                        <Typography
                            variant="h6"
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
                            href="mailto:kdo.020@bfvgu.steiermark.at"
                            color="inherit"
                            underline="hover"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mt: 2,
                                // color: theme.palette.warning.light,
                                fontFamily: '"Roboto", "Arial", sans-serif',
                            }}
                        >
                            <Email sx={{ mr: 1 }} /> kdo.020@bfvgu.steiermark.at
                        </Link>
                    </Grid>

                    {/* Section: Information */}
                    <Grid item xs={12} sm={4}>
                        <Typography
                            variant="h6"
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
                                <Link
                                    href="#"
                                    color="inherit"
                                    underline="hover"
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mb: 1,
                                        fontFamily: '"Roboto", "Arial", sans-serif',
                                    }}
                                >
                                    <Info sx={{ mr: 1 }} /> Impressum
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    color="inherit"
                                    underline="hover"
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        fontFamily: '"Roboto", "Arial", sans-serif',
                                    }}
                                >
                                    <Phone sx={{ mr: 1 }} /> Kontakt
                                </Link>
                            </li>
                        </Box>
                    </Grid>

                    {/* Section: Links */}
                    <Grid item xs={12} sm={4}>
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                                borderBottom: `3px solid ${theme.palette.warning.main}`,
                                display: "inline-block",
                                pb: 0.5,
                                fontFamily: '"Roboto", "Arial", sans-serif',
                            }}
                        >
                            LINKS
                        </Typography>
                        <Box component="ul" sx={{ listStyle: "none", pl: 0, mt: 2 }}>
                            <li>
                                <Link
                                    href="#"
                                    color="inherit"
                                    underline="hover"
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mb: 1,
                                        fontFamily: '"Roboto", "Arial", sans-serif',
                                    }}
                                >
                                    <Facebook sx={{ mr: 1 }} /> Facebook
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    color="inherit"
                                    underline="hover"
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        fontFamily: '"Roboto", "Arial", sans-serif',
                                    }}
                                >
                                    <Instagram sx={{ mr: 1 }} /> Instagram
                                </Link>
                            </li>
                        </Box>
                    </Grid>
                </Grid>

                {/* Footer Bottom */}
                <Box
                    sx={{
                        textAlign: "center",
                        borderTop: `1px solid ${theme.palette.primary.dark}`,
                        mt: 4,
                        pt: 2,
                        color: theme.palette.grey[300],
                    }}
                >
                    <Typography variant="body2">
                        &copy; {new Date().getFullYear()} Freiwillige Feuerwehr Hausmannstätten. Alle Rechte
                        vorbehalten.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
