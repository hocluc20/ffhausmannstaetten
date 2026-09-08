import React from 'react';
import Slider from "react-slick";
import { Box, Button, Typography } from "@mui/material";
import { motion, useReducedMotion } from "motion/react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Link as RouterLink } from "react-router-dom";

const slides = [
    { file: "FFHausMitAutos", alt: "Das Rüsthaus der FF Hausmannstätten mit ausgerückten Fahrzeugen" },
    { file: "FFHausSeitlich", alt: "Seitenansicht des Rüsthauses der FF Hausmannstätten" },
    { file: "FFHausVorne", alt: "Vorderansicht des Rüsthauses der FF Hausmannstätten" },
];

/** Hoehe der Buehne je Breakpoint - auf dem Handy bewusst nicht 100vh. */
const HERO_HEIGHT = { xs: "78vh", sm: "80vh", md: "92vh", lg: "100vh" };

const SlideshowLandingPage: React.FC = () => {
    const reduced = useReducedMotion();

    const settings = {
        dots: true,
        infinite: true,
        speed: reduced ? 0 : 800,
        fade: !reduced,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: !reduced,
        autoplaySpeed: 6000,
        arrows: false,
        pauseOnHover: false,
        lazyLoad: "ondemand" as const,
    };

    return (
        <Box
            sx={{
                position: 'relative',
                height: HERO_HEIGHT,
                width: '100%',
                overflow: 'hidden',
                // Die angeschraegte Unterkante des Headers liegt auf der Buehne auf.
                marginTop: { xs: 0, md: "-22px" },
                backgroundColor: "#2b2422",
                "& .slick-slider, & .slick-list, & .slick-track, & .slick-slide > div": {
                    height: "100%",
                },
                "& .slick-dots": {
                    bottom: { xs: 16, md: 28 },
                    zIndex: 3,
                },
                "& .slick-dots li button:before": {
                    color: "#ffffff",
                    opacity: 0.55,
                    fontSize: 10,
                },
                "& .slick-dots li.slick-active button:before": {
                    color: "#ffd700",
                    opacity: 1,
                },
            }}
        >
            <Box sx={{ position: "absolute", inset: 0 }}>
                <Slider {...settings}>
                    {slides.map((slide, index) => (
                        <Box key={slide.file} sx={{ height: HERO_HEIGHT }}>
                            <picture>
                                <source srcSet={`/images/${slide.file}.webp`} type="image/webp" />
                                <Box
                                    component="img"
                                    src={`/images/${slide.file}.jpg`}
                                    alt={slide.alt}
                                    loading={index === 0 ? "eager" : "lazy"}
                                    fetchPriority={index === 0 ? "high" : "low"}
                                    decoding="async"
                                    sx={{
                                        width: '100%',
                                        height: HERO_HEIGHT,
                                        objectFit: 'cover',
                                        display: 'block',
                                        // Langsamer Zoom haelt die Buehne in Bewegung.
                                        animation: reduced ? "none" : "heroZoom 18s ease-in-out infinite alternate",
                                        "@keyframes heroZoom": {
                                            from: { transform: "scale(1)" },
                                            to: { transform: "scale(1.08)" },
                                        },
                                    }}
                                />
                            </picture>
                        </Box>
                    ))}
                </Slider>
            </Box>

            {/* Verlauf fuer Lesbarkeit */}
            <Box
                aria-hidden="true"
                sx={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
                    background:
                        "linear-gradient(180deg, rgba(26,22,20,.55) 0%, rgba(26,22,20,.15) 35%, rgba(26,22,20,.78) 100%)",
                }}
            />

            {/* Titel ueber der Buehne */}
            <Box
                sx={{
                    position: "relative",
                    zIndex: 2,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    px: 2,
                    "& > *": { maxWidth: "100%" },
                    pb: { xs: 10, md: 12 },
                    pt: { xs: 4, md: 6 },
                    pointerEvents: "none",
                }}
            >
                <Typography
                    variant="overline"
                    component={motion.p}
                    initial={reduced ? { opacity: 1 } : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    sx={{ color: "secondary.main", mb: 1 }}
                >
                    Freiwillige Feuerwehr
                </Typography>

                <Typography
                    variant="h1"
                    component={motion.h1}
                    initial={reduced ? { opacity: 1 } : { opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    sx={{
                        color: "#ffffff",
                        fontSize: { xs: "2.3rem", sm: "3.4rem", md: "5rem" },
                        textShadow: "0 4px 24px rgba(0,0,0,.55)",
                        textWrap: "balance",
                        overflowWrap: "break-word",
                    }}
                >
                    Hausmannstätten
                </Typography>

                <Typography
                    component={motion.p}
                    initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    sx={{
                        color: "rgba(255,255,255,.92)",
                        mt: 1.5,
                        width: "100%",
                        maxWidth: "44ch",
                        fontSize: { xs: "1rem", md: "1.15rem" },
                        textShadow: "0 2px 12px rgba(0,0,0,.6)",
                    }}
                >
                    Ehrenamtlich im Einsatz für unsere Gemeinde - bei Brand, technischer
                    Hilfeleistung und Katastrophenschutz.
                </Typography>

                <Box
                    component={motion.div}
                    initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.55 }}
                    sx={{
                        mt: 3.5,
                        display: "flex",
                        gap: 1.5,
                        flexWrap: "wrap",
                        justifyContent: "center",
                        pointerEvents: "auto",
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        component={RouterLink}
                        to="/einsaetzeUndTaetigkeiten"
                    >
                        Unsere Einsätze
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        component={RouterLink}
                        to="/mannschaft"
                        sx={{
                            color: "#ffffff",
                            borderColor: "rgba(255,255,255,.7)",
                            "&:hover": { borderColor: "#ffd700", backgroundColor: "rgba(255,215,0,.12)" },
                        }}
                    >
                        Die Mannschaft
                    </Button>
                </Box>
            </Box>

            {/* Scrollhinweis */}
            <Box
                component={motion.div}
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                sx={{
                    position: "absolute",
                    bottom: { xs: 40, md: 56 },
                    left: "50%",
                    zIndex: 2,
                    transform: "translateX(-50%)",
                    color: "rgba(255,255,255,.85)",
                    display: { xs: "none", sm: "block" },
                    animation: reduced ? "none" : "bob 2.2s ease-in-out infinite",
                    "@keyframes bob": {
                        "0%,100%": { transform: "translate(-50%, 0)" },
                        "50%": { transform: "translate(-50%, 10px)" },
                    },
                }}
            >
                <KeyboardArrowDownIcon sx={{ fontSize: "2.5rem" }} />
            </Box>
        </Box>
    );
};

export default SlideshowLandingPage;
