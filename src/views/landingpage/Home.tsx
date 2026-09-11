import React, { useMemo } from 'react';
import { Box, Button, Card, Container, Grid, Typography } from '@mui/material';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import SlideshowLandingPage from "../../components/slideshow/SlideshowLandingPage";
import ImageWithText from "../../components/image/ImageWithText";
import WelcomePopup from "../../components/popups/WelcomePopup";
import CountUp from "react-countup";
import FireTruckIcon from '@mui/icons-material/FireTruck';
import FireHydrantAltIcon from '@mui/icons-material/FireHydrantAlt';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link as RouterLink } from "react-router-dom";
import { useAPI } from "../../common/context/DataContext";
import { CardSkeletons, EmptyState, LoadError } from "../../components/feedback/DataState";
import ParallaxSection from "../../components/header/ParallaxSection";
import SectionHeading from "../../components/layout/SectionHeading";
import { Stagger, StaggerItem } from "../../components/motion/Reveal";

/** Anzahl der Einsaetze auf der Startseite. */
const HIGHLIGHT_COUNT = 6;

const dateFormatter = new Intl.DateTimeFormat('de-AT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
});

const Home: React.FC = () => {
    const { operations, isLoading, error, reload, settings } = useAPI();

    const stats = useMemo(() => {
        const currentYear = settings.year || new Date().getFullYear();

        // Die Einsatzzahl ist bewusst nicht im Adminbereich pflegbar: sie
        // zaehlt die tatsaechlich erfassten Einsaetze des laufenden Jahres.
        // Bevorzugt der vom Server gezaehlte Wert (kennt auch Beitraege, die
        // hier gerade nicht geladen sind); sonst aus den geladenen Daten.
        const operationsThisYear =
            settings.operationsThisYear ||
            operations.filter(
                (operation) =>
                    operation.kind === "einsatz" && operation.date.getFullYear() === currentYear
            ).length;

        return [
            {
                icon: <FireHydrantAltIcon sx={{ fontSize: "3.2rem" }} />,
                value: operationsThisYear,
                label: `Einsätze ${currentYear}`,
            },
            { icon: <PersonIcon sx={{ fontSize: "3.2rem" }} />, value: settings.members, label: "Mitglieder" },
            { icon: <FireTruckIcon sx={{ fontSize: "3.2rem" }} />, value: settings.vehicles, label: "Fahrzeuge" },
        ];
    }, [operations, settings]);

    const highlights = operations.slice(0, HIGHLIGHT_COUNT);

    const renderNews = () => {
        if (isLoading) return <CardSkeletons count={3} />;
        if (error) return <LoadError message={error} onRetry={reload} />;
        if (highlights.length === 0) {
            return <EmptyState message="Zurzeit sind keine Berichte verfügbar." />;
        }

        return (
            <Stagger>
                <Grid container spacing={{ xs: 2.5, md: 4 }} justifyContent="center">
                    {highlights.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                            <StaggerItem style={{ height: '100%' }}>
                                <ImageWithText
                                    text={item.title}
                                    title={item.type?.name_short ?? ""}
                                    kind={item.kind}
                                    imageUrl={item.headline_image_rendered}
                                    date={dateFormatter.format(item.date)}
                                    id={String(item.id)}
                                />
                            </StaggerItem>
                        </Grid>
                    ))}
                </Grid>
            </Stagger>
        );
    };

    return (
        <Box sx={{ width: "100%", maxWidth: "100%" }}>
            <WelcomePopup />

            <SlideshowLandingPage />

            {/* Kennzahlen */}
            <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
                <Stagger>
                    <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
                        {stats.map((stat) => (
                            <Grid item xs={12} sm={4} key={stat.label}>
                                <StaggerItem>
                                    <Card
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 2,
                                            p: { xs: 2.5, md: 3 },
                                            height: "100%",
                                            border: "1px solid",
                                            borderColor: "divider",
                                            boxShadow: "0 6px 22px rgba(26,22,20,.07)",
                                            transition: "transform .3s ease, box-shadow .3s ease",
                                            "&:hover": {
                                                transform: "translateY(-5px)",
                                                boxShadow: "0 14px 34px rgba(26,22,20,.13)",
                                            },
                                            "@media (prefers-reduced-motion: reduce)": {
                                                transition: "none",
                                                "&:hover": { transform: "none" },
                                            },
                                        }}
                                    >
                                        <Box sx={{ color: "primary.main", display: "flex" }}>
                                            {stat.icon}
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant="h3"
                                                sx={{
                                                    fontSize: { xs: "2.2rem", md: "2.6rem" },
                                                    lineHeight: 1,
                                                    color: "text.primary",
                                                }}
                                            >
                                                <CountUp
                                                    start={0}
                                                    end={stat.value}
                                                    duration={2.4}
                                                    enableScrollSpy
                                                    scrollSpyOnce
                                                />
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {stat.label}
                                            </Typography>
                                        </Box>
                                    </Card>
                                </StaggerItem>
                            </Grid>
                        ))}
                    </Grid>
                </Stagger>
            </Container>

            <ParallaxSection
                image="sam_3937.jpg"
                eyebrow="Aus dem Einsatzgeschehen"
                headerText="Neuigkeiten"
                headerSize="h2"
                heightInRem={22}
                polygon="polygon(0 8%, 100% 0, 100% 92%, 0 100%)"
            />

            <Container maxWidth="lg" sx={{ py: { xs: 5, md: 9 } }}>
                <SectionHeading
                    eyebrow="Berichte"
                    title="Aktuelle Einsätze und Tätigkeiten"
                    subtitle="Ein Auszug aus unserer Arbeit."
                />

                {renderNews()}

                {highlights.length > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: { xs: 4, md: 6 } }}>
                        <Button
                            variant="contained"
                            size="large"
                            endIcon={<ArrowForwardIcon />}
                            component={RouterLink}
                            to="/einsaetzeUndTaetigkeiten"
                        >
                            Alle Tätigkeiten
                        </Button>
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default Home;
