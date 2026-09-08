import React, { useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Dialog,
    DialogContent,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { findVehicle, resolveFleet } from "../../data/vehicles";
import { useAPI } from "../../common/context/DataContext";
import VehicleImage from "../../components/fahrzeuge/VehicleImage";
import NotFound from "../notfound/NotFound";
import SectionHeading from "../../components/layout/SectionHeading";
import Reveal, { Stagger, StaggerItem } from "../../components/motion/Reveal";

const FahrzeugDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { fleet } = useAPI();
    const [lightbox, setLightbox] = useState<number | null>(null);

    // Aus dem Adminbereich, sonst die mitgelieferte Liste.
    const vehicles = resolveFleet(fleet);
    const vehicle = findVehicle(vehicles, slug);

    if (!vehicle) return <NotFound />;

    const index = vehicles.findIndex((v) => v.slug === vehicle.slug);
    const next = vehicles[(index + 1) % vehicles.length];
    const openPhoto = lightbox !== null ? vehicle.photos[lightbox] : undefined;

    return (
        <>
            {/* Kopfbereich in denselben Farben wie die Fahrzeugübersicht, damit
                der Wechsel dorthin nicht wie ein Bruch wirkt. */}
            <Box
                sx={{
                    background: "linear-gradient(150deg, #2b2422 0%, #4d1414 60%, #751616 100%)",
                    color: "#ffffff",
                    pt: { xs: 4, md: 7 },
                    pb: { xs: 14, md: 20 },
                    clipPath: { xs: "none", md: "polygon(0 0, 100% 0, 100% 88%, 0 100%)" },
                }}
            >
                <Container maxWidth="lg">
                    <Button
                        component={RouterLink}
                        to="/fahrzeuge"
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            color: "#ffffff",
                            mb: 2,
                            pl: 0,
                            "&:hover": { backgroundColor: "rgba(255,255,255,.1)" },
                        }}
                    >
                        Alle Fahrzeuge
                    </Button>

                    <Typography variant="overline" sx={{ color: "secondary.main", display: "block" }}>
                        Fuhrpark
                    </Typography>
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: "2.6rem", sm: "3.4rem", md: "4.5rem" },
                            textWrap: "balance",
                        }}
                    >
                        {vehicle.short}
                    </Typography>
                    <Typography
                        sx={{
                            color: "rgba(255,255,255,.9)",
                            fontSize: { xs: "1.05rem", md: "1.25rem" },
                            maxWidth: "52ch",
                            mt: 1,
                        }}
                    >
                        {vehicle.name}
                    </Typography>
                    {vehicle.callSign && (
                        <Chip
                            label={`Funkrufname: ${vehicle.callSign}`}
                            size="small"
                            sx={{ mt: 2, backgroundColor: "rgba(255,255,255,.15)", color: "#ffffff" }}
                        />
                    )}
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 10 } }}>
                {/* Hauptbild überlappt den Kopfbereich. */}
                <Reveal>
                    <Card
                        sx={{
                            mt: { xs: -10, md: -14 },
                            mb: { xs: 4, md: 6 },
                            border: "1px solid",
                            borderColor: "divider",
                            boxShadow: "0 20px 50px rgba(26,22,20,.2)",
                            overflow: "hidden",
                        }}
                    >
                        <Box
                            sx={{
                                backgroundColor: "#eceff1",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                p: { xs: 2, md: 4 },
                                minHeight: { xs: 200, md: 280 },
                            }}
                        >
                            <VehicleImage
                                photo={vehicle.photos[0]}
                                alt={`${vehicle.short} - ${vehicle.photos[0]?.caption ?? vehicle.name}`}
                                loading="eager"
                                sx={{
                                    width: "100%",
                                    maxHeight: { xs: "40vh", md: "52vh" },
                                    objectFit: "contain",
                                }}
                            />
                        </Box>
                    </Card>
                </Reveal>

                <Grid container spacing={{ xs: 3, md: 4 }}>
                    {/* Beschreibung und Aufgaben */}
                    <Grid item xs={12} md={7}>
                        <Reveal>
                            <Typography variant="h4" component="h2" gutterBottom color="primary.dark">
                                Über dieses Fahrzeug
                            </Typography>
                            <Typography variant="body1" sx={{ fontSize: "1.08rem", mb: 3 }}>
                                {vehicle.description}
                            </Typography>

                            <Typography variant="h6" component="h3" gutterBottom>
                                Aufgaben im Einsatz
                            </Typography>
                            <List disablePadding>
                                {vehicle.tasks.map((task) => (
                                    <ListItem key={task} disableGutters sx={{ alignItems: "flex-start" }}>
                                        <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                                            <CheckCircleIcon sx={{ color: "primary.main", fontSize: "1.2rem" }} />
                                        </ListItemIcon>
                                        <ListItemText primary={task} />
                                    </ListItem>
                                ))}
                            </List>
                        </Reveal>
                    </Grid>

                    {/* Technische Daten */}
                    <Grid item xs={12} md={5}>
                        <Reveal delay={0.1}>
                            <Card
                                sx={{
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderTop: "4px solid",
                                    borderTopColor: "secondary.main",
                                }}
                            >
                                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                                    <Typography variant="h6" component="h3" gutterBottom>
                                        Technische Daten
                                    </Typography>

                                    {vehicle.specs.length > 0 ? (
                                        <Box component="dl" sx={{ m: 0 }}>
                                            {vehicle.specs.map((spec) => (
                                                <Box
                                                    key={spec.label}
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        gap: 2,
                                                        py: 1.1,
                                                        borderBottom: "1px solid",
                                                        borderColor: "divider",
                                                        "&:last-of-type": { borderBottom: 0 },
                                                    }}
                                                >
                                                    <Box component="dt" sx={{ color: "text.secondary" }}>
                                                        {spec.label}
                                                    </Box>
                                                    <Box
                                                        component="dd"
                                                        sx={{ m: 0, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
                                                    >
                                                        {spec.value}
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    ) : (
                                        // Ehrliche Lücke statt der kopierten TLFA-Werte,
                                        // die vorher bei jedem Fahrzeug standen.
                                        <Typography variant="body2" color="text.secondary">
                                            Die technischen Daten für dieses Fahrzeug werden gerade
                                            erhoben und hier ergänzt.
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Reveal>
                    </Grid>
                </Grid>

                {/* Fotogalerie */}
                <Box sx={{ mt: { xs: 5, md: 8 } }}>
                    <SectionHeading
                        eyebrow="Bildergalerie"
                        title={`${vehicle.short} in Bildern`}
                        align="left"
                    />
                    <Stagger>
                        <Grid container spacing={{ xs: 2, md: 3 }}>
                            {vehicle.photos.map((photo, photoIndex) => (
                                <Grid item xs={12} sm={6} key={photo.url}>
                                    <StaggerItem style={{ height: "100%" }}>
                                        <Card
                                            component="button"
                                            type="button"
                                            onClick={() => setLightbox(photoIndex)}
                                            aria-label={`${photo.caption} vergrößern`}
                                            sx={{
                                                width: "100%",
                                                p: 0,
                                                border: "1px solid",
                                                borderColor: "divider",
                                                cursor: "pointer",
                                                textAlign: "left",
                                                display: "block",
                                                overflow: "hidden",
                                                transition: "transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s ease",
                                                "&:hover": {
                                                    transform: "translateY(-5px)",
                                                    boxShadow: "0 16px 36px rgba(26,22,20,.16)",
                                                },
                                                "&:hover .zoom": { opacity: 1 },
                                                "@media (prefers-reduced-motion: reduce)": {
                                                    transition: "none",
                                                    "&:hover": { transform: "none" },
                                                },
                                            }}
                                        >
                                            <Box sx={{ position: "relative", backgroundColor: "#eceff1" }}>
                                                <VehicleImage
                                                    photo={photo}
                                                    alt={`${vehicle.short} - ${photo.caption}`}
                                                    sx={{
                                                        width: "100%",
                                                        height: { xs: 200, md: 260 },
                                                        objectFit: "contain",
                                                    }}
                                                />
                                                <Box
                                                    className="zoom"
                                                    sx={{
                                                        position: "absolute",
                                                        top: 10,
                                                        right: 10,
                                                        opacity: 0,
                                                        transition: "opacity .3s ease",
                                                        backgroundColor: "rgba(255,255,255,.9)",
                                                        borderRadius: "50%",
                                                        p: 0.6,
                                                        display: "flex",
                                                    }}
                                                >
                                                    <ZoomInIcon sx={{ color: "primary.main" }} />
                                                </Box>
                                            </Box>
                                            <CardContent sx={{ py: 1.5 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {photo.caption}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </StaggerItem>
                                </Grid>
                            ))}
                        </Grid>
                    </Stagger>
                </Box>

                {/* Weiter zum nächsten Fahrzeug */}
                <Box
                    sx={{
                        mt: { xs: 5, md: 8 },
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Button component={RouterLink} to="/fahrzeuge" startIcon={<ArrowBackIcon />} variant="outlined">
                        Zur Übersicht
                    </Button>
                    <Button
                        component={RouterLink}
                        to={`/fahrzeuge/${next.slug}`}
                        endIcon={<NavigateNextIcon />}
                        variant="contained"
                    >
                        Weiter: {next.short}
                    </Button>
                </Box>
            </Container>

            <Dialog open={openPhoto !== undefined} onClose={() => setLightbox(null)} maxWidth="lg" fullWidth>
                <DialogContent sx={{ position: "relative", p: { xs: 1, md: 2 }, backgroundColor: "#eceff1" }}>
                    <IconButton
                        onClick={() => setLightbox(null)}
                        aria-label="Schließen"
                        sx={{
                            position: "absolute",
                            right: 12,
                            top: 12,
                            zIndex: 1,
                            backgroundColor: "rgba(255,255,255,.9)",
                            "&:hover": { backgroundColor: "#ffffff" },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    {openPhoto && (
                        <>
                            <VehicleImage
                                photo={openPhoto}
                                alt={`${vehicle.short} - ${openPhoto.caption}`}
                                loading="eager"
                                sx={{ width: "100%", height: "auto" }}
                            />
                            <Typography variant="body2" align="center" sx={{ py: 1.5 }}>
                                {openPhoto.caption}
                            </Typography>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default FahrzeugDetail;
