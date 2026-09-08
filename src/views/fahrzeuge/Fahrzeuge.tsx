import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as motion from 'motion/react-client';
import './Fahrzeuge.css';
import Presence from "../../components/motion/Presence";
import {
    Box,
    Button,
    Card,
    CardContent,
    List,
    ListItem,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { resolveFleet } from "../../data/vehicles";
import { useAPI } from "../../common/context/DataContext";
import VehicleImage from "../../components/fahrzeuge/VehicleImage";

const Fahrzeuge = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    const frame = useRef<number | null>(null);
    const { fleet } = useAPI();

    // Aus dem Adminbereich, sonst die mitgelieferte Liste.
    const vehicles = useMemo(() => resolveFleet(fleet), [fleet]);

    const handleScroll = useCallback(() => {
        // Ueber requestAnimationFrame gedrosselt: vorher hat jedes einzelne
        // Scroll-Event ein Layout erzwungen (scrollHeight/innerHeight lesen).
        if (frame.current !== null) return;

        frame.current = requestAnimationFrame(() => {
            frame.current = null;
            const scrollRange = document.body.scrollHeight - window.innerHeight;
            if (scrollRange <= 0 || vehicles.length === 0) return;

            const sectionHeight = scrollRange / vehicles.length;
            const newIndex = Math.min(
                Math.max(Math.floor(window.scrollY / sectionHeight), 0),
                vehicles.length - 1
            );
            setCurrentIndex((previous) => (previous === newIndex ? previous : newIndex));
        });
    }, [vehicles.length]);

    useEffect(() => {
        if (!isDesktop) return;

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (frame.current !== null) cancelAnimationFrame(frame.current);
        };
    }, [handleScroll, isDesktop]);

    // Wird der Fuhrpark nachgeladen, kann der Index ins Leere zeigen.
    useEffect(() => {
        setCurrentIndex((previous) => Math.min(previous, Math.max(vehicles.length - 1, 0)));
    }, [vehicles.length]);

    // Nur das jeweils naechste Bild vorladen. Vorher wurden beim Mounten alle
    // Fahrzeugbilder in Originalaufloesung geladen (rund 40 MB).
    useEffect(() => {
        const next = vehicles[currentIndex + 1];
        if (!next || !next.photos[0]) return;
        const img = new Image();
        img.src = next.photos[0].url;
    }, [currentIndex, vehicles]);

    // Unterhalb von md ist die scrollgesteuerte Buehne nicht bedienbar
    // (fixe Prozentbreiten, pointer-events: none). Dort eine schlichte Liste.
    if (!isDesktop) {
        return (
            <Box sx={{ px: 2, py: 4, display: 'grid', gap: 3 }}>
                <Typography variant="h3" component="h1" color="primary.dark" textAlign="center">
                    Unsere Fahrzeuge
                </Typography>
                {vehicles.map((vehicle) => (
                    <Card key={vehicle.slug} sx={{ overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                        <VehicleImage
                            photo={vehicle.photos[0]}
                            alt={`${vehicle.short} - ${vehicle.name}`}
                            sx={{ width: '100%', height: 'auto', backgroundColor: '#eceff1' }}
                        />
                        <CardContent>
                            <Typography variant="h5" component="h2" color="primary.dark">
                                {vehicle.short}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {vehicle.name}
                            </Typography>

                            {vehicle.specs.length > 0 && (
                                <List dense disablePadding sx={{ mb: 1 }}>
                                    {vehicle.specs.map((spec) => (
                                        <ListItem
                                            key={spec.label}
                                            disableGutters
                                            sx={{ justifyContent: 'space-between', gap: 2 }}
                                        >
                                            <Typography variant="body2" color="text.secondary">
                                                {spec.label}
                                            </Typography>
                                            <Typography variant="body1" fontWeight={600}>
                                                {spec.value}
                                            </Typography>
                                        </ListItem>
                                    ))}
                                </List>
                            )}

                            <Button
                                component={RouterLink}
                                to={`/fahrzeuge/${vehicle.slug}`}
                                variant="contained"
                                endIcon={<ArrowForwardIcon />}
                                fullWidth
                                sx={{ mt: 1 }}
                            >
                                Details & Fotos
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        );
    }

    const transition = prefersReducedMotion
        ? { duration: 0 }
        : { type: 'tween' as const, duration: 0.4 };
    const enter = prefersReducedMotion ? { x: 0, opacity: 0 } : { x: '-100vw', opacity: 0 };
    const leave = prefersReducedMotion ? { x: 0, opacity: 0 } : { x: '100vw', opacity: 0 };

    return (
        <div className="fahrzeuge-container">
            <div
                className="background"
                style={{ backgroundImage: 'url("/images/FFHausVorne.jpg")' }}
            ></div>

            {/* Fuer Screenreader und Suchmaschinen bleibt die Liste vollstaendig lesbar. */}
            <h1 className="visually-hidden">Unsere Fahrzeuge</h1>

            <div className="carousel">
                <Presence mode="wait">
                    {vehicles.map((vehicle, index) =>
                        index === currentIndex ? (
                            <motion.div key={vehicle.slug} className={"carousel-container"}>
                                <motion.div
                                    initial={enter}
                                    animate={{ x: '0vw', opacity: 1 }}
                                    exit={leave}
                                    transition={transition}
                                    className="carousel-image"
                                >
                                    <VehicleImage
                                        photo={vehicle.photos[0]}
                                        alt={`${vehicle.short} - ${vehicle.name}`}
                                        loading="eager"
                                    />
                                </motion.div>
                                <motion.div
                                    initial={enter}
                                    animate={{ x: '0vw', opacity: 1 }}
                                    exit={leave}
                                    transition={transition}
                                    className="carousel-text"
                                >
                                    <Typography variant="h3" component="h2" sx={{ color: "primary.dark" }}>
                                        {vehicle.short}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                                        {vehicle.name}
                                    </Typography>

                                    {vehicle.specs.length > 0 ? (
                                        <List dense disablePadding>
                                            {vehicle.specs.map((spec) => (
                                                <ListItem
                                                    key={spec.label}
                                                    disableGutters
                                                    sx={{
                                                        justifyContent: "center",
                                                        borderTop: "1px solid",
                                                        borderColor: "divider",
                                                        py: 0.75,
                                                    }}
                                                >
                                                    <Typography variant="body1">
                                                        {spec.label}: <strong>{spec.value}</strong>
                                                    </Typography>
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                                            Technische Daten folgen.
                                        </Typography>
                                    )}

                                    {/* Weg in die Detailansicht mit allen Fotos. */}
                                    <Button
                                        component={RouterLink}
                                        to={`/fahrzeuge/${vehicle.slug}`}
                                        variant="contained"
                                        endIcon={<ArrowForwardIcon />}
                                        sx={{ mt: 2 }}
                                    >
                                        Details & Fotos
                                    </Button>
                                </motion.div>
                            </motion.div>
                        ) : null
                    )}
                </Presence>
            </div>

            {/* Fortschritt sichtbar machen - vorher gab es keinen Hinweis, dass gescrollt werden muss. */}
            <div className="carousel-progress" aria-hidden="true">
                {vehicles.map((vehicle, index) => (
                    <span
                        key={vehicle.slug}
                        className={index === currentIndex ? "dot active" : "dot"}
                    />
                ))}
            </div>
        </div>
    );
};

export default Fahrzeuge;
