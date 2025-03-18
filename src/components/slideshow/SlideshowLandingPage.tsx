import React from 'react';
import Slider from "react-slick";
import { Box } from "@mui/material";

const settings = {
    dots: true,          // Punkte anzeigen
    infinite: true,      // Unendliches Scrollen aktivieren
    speed: 500,          // Übergangsgeschwindigkeit
    slidesToShow: 1,     // Nur 1 Bild gleichzeitig anzeigen
    slidesToScroll: 1,   // 1 Bild auf einmal scrollen
    autoplay: true,      // Automatisches Abspielen aktivieren
    autoplaySpeed: 5000, // Geschwindigkeit des Autoplay (5 Sekunden)
    arrows: false,       // Pfeile ausblenden
    centerMode: false,   // Kein Centering der Slides, falls Slider sie überlappt
    variableWidth: false // Breite auf gleichmäßig setzen
};

const SlideshowLandingPage = () => {
    return (
        <Box
            sx={{
                height: '100vh',  // Höhe auf 100% der Viewport-Höhe setzen
                width: '100%',
                overflow: 'hidden', // Overflow ausblenden, um Scrollen zu verhindern
                margin: 0,        // Kein Margin
                padding: 0,       // Kein Padding
                position: 'relative', // Positionierung relativ für Slider
                marginTop: {
                    lg: "-15rem",
                    xs: "-1rem",
                    md: "-10rem"},
                backgroundPosition: "cover",
                // boxShadow: "-webkit-box-shadow: 0px 0px 14px 3px rgba(0,0,0,0.74);-moz-box-shadow: 0px 0px 14px 3px rgba(0,0,0,0.74);box-shadow: 0px 0px 14px 3px rgba(0,0,0,0.74);"
            }}
        >
            <Slider {...settings}>
                {/* Bild 1 */}
                <Box
                    component="img"
                    src="/images/FFHausMitAutos.jpg" // Bild aus dem public-Ordner
                    alt="Bild 1"
                    sx={{
                        width: '100%',   // Breite auf 100% setzen
                        height: '100%',  // Höhe auf 100% setzen, damit das Bild den gesamten Container ausfüllt
                        objectFit: 'cover', // Bild so skalieren, dass es den Container ausfüllt
                        margin: 0,       // Kein Margin
                        padding: 0,      // Kein Padding
                    }}
                />
                {/* Bild 2 */}
                <Box
                    component="img"
                    src="/images/FFHausSeitlich.jpg"
                    alt="Bild 2"
                    sx={{
                        width: '100%',   // Breite auf 100% setzen
                        height: '100%',  // Höhe auf 100% setzen
                        objectFit: 'cover', // Bild so skalieren, dass es den Container ausfüllt
                        margin: 0,       // Kein Margin
                        padding: 0,      // Kein Padding
                    }}
                />
                {/* Bild 3 */}
                <Box
                    component="img"
                    src="/images/FFHausVorne.jpg"
                    alt="Bild 3"
                    sx={{
                        width: '100%',   // Breite auf 100% setzen
                        height: '100%',  // Höhe auf 100% setzen
                        objectFit: 'cover', // Bild so skalieren, dass es den Container ausfüllt
                        margin: 0,       // Kein Margin
                        padding: 0,      // Kein Padding
                    }}
                />
            </Slider>
        </Box>
    );
};

export default SlideshowLandingPage;
