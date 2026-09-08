import React, { useRef } from "react";
import { Box, Typography } from "@mui/material";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

interface ParallaxSectionProps {
    /** Bildquelle: entweder Dateiname in /images oder eine vollstaendige URL. */
    image: string;
    /** true, wenn `image` bereits eine fertige URL ist (z. B. aus WordPress). */
    absoluteUrl?: boolean;
    headerText?: string;
    headerSize?: "h1" | "h2" | "h3" | "h4";
    /** Kleine Zeile ueber der Ueberschrift. */
    eyebrow?: string;
    polygon?: string;
    heightInRem?: number;
    children?: React.ReactNode;
}

/**
 * Abschnitt mit stehendem Hintergrundbild, ueber das der Inhalt scrollt.
 *
 * Umgesetzt ueber eine verschobene Ebene statt ueber
 * `background-attachment: fixed`: letzteres erzwingt bei jedem Scrollframe
 * ein Neuzeichnen der ganzen Flaeche und wird von iOS Safari komplett
 * ignoriert - dort gab es bisher gar keinen Effekt. Die Transform-Variante
 * laeuft auf der GPU und funktioniert auf allen Geraeten gleich.
 */
const ParallaxSection: React.FC<ParallaxSectionProps> = ({
    image,
    absoluteUrl = false,
    headerText,
    headerSize = "h2",
    eyebrow,
    polygon,
    heightInRem = 20,
    children,
}) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const reduced = useReducedMotion();

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    // Die Ebene ist hoeher als der Abschnitt; sie wandert gegenlaeufig zum
    // Scrollen, wodurch das Bild optisch stehen bleibt.
    const y = useTransform(scrollYProgress, [0, 1], ["-18%", "18%"]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.06, 1, 1.06]);

    const src = absoluteUrl ? image : `/images/${image}`;
    const webp = absoluteUrl ? null : `/images/${image.replace(/\.(png|jpe?g)$/i, ".webp")}`;

    const backgroundImage = webp
        ? `image-set(url("${webp}") type("image/webp"), url("${src}") type("image/jpeg"))`
        : `url("${src}")`;

    return (
        <Box
            ref={ref}
            sx={{
                position: "relative",
                overflow: "hidden",
                isolation: "isolate",
                width: "100%",
                minHeight: {
                    xs: `${Math.max(heightInRem * 0.62, 11)}rem`,
                    sm: `${heightInRem * 0.8}rem`,
                    md: `${heightInRem}rem`,
                },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                px: 2,
                py: { xs: 5, md: 6 },
                "& > *": { maxWidth: "100%" },
                backgroundColor: "#2b2422",
                // Der Zuschnitt gilt nur dort, wo genug Flaeche da ist.
                clipPath: { xs: "none", md: polygon ?? "none" },
            }}
        >
            <Box
                component={motion.div}
                aria-hidden="true"
                style={reduced ? undefined : { y, scale }}
                sx={{
                    position: "absolute",
                    top: "-20%",
                    left: 0,
                    width: "100%",
                    height: "140%",
                    backgroundImage,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    zIndex: -2,
                    willChange: "transform",
                }}
            />

            {/* Verlauf, damit heller Text auf jedem Foto lesbar bleibt. */}
            <Box
                aria-hidden="true"
                sx={{
                    position: "absolute",
                    inset: 0,
                    zIndex: -1,
                    background:
                        "linear-gradient(180deg, rgba(26,22,20,.62) 0%, rgba(26,22,20,.38) 45%, rgba(117,22,22,.62) 100%)",
                }}
            />

            {eyebrow && (
                <Typography
                    variant="overline"
                    component={motion.p}
                    initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5 }}
                    sx={{
                        color: "secondary.main",
                        mb: 1.25,
                        textAlign: "center",
                        // Gold auf einem Foto braucht einen Schatten, sonst
                        // verschwindet die Zeile auf hellen Bildstellen.
                        textShadow: "0 2px 10px rgba(0,0,0,.85)",
                    }}
                >
                    {eyebrow}
                </Typography>
            )}

            {headerText && (
                <Typography
                    variant={headerSize}
                    component={motion.h2}
                    initial={reduced ? { opacity: 1 } : { opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                    sx={{
                        color: "#ffffff",
                        textAlign: "center",
                        textWrap: "balance",
                        fontSize: {
                            xs: "2.1rem",
                            sm: "2.8rem",
                            md: headerSize === "h1" ? "4rem" : "3.2rem",
                        },
                        textShadow: "0 2px 18px rgba(0,0,0,.6)",
                        maxWidth: { xs: "100%", sm: "18ch" },
                        overflowWrap: "break-word",
                    }}
                >
                    {headerText}
                </Typography>
            )}

            {/* Goldener Strich als wiederkehrendes Motiv der Marke. */}
            {headerText && (
                <Box
                    component={motion.span}
                    aria-hidden="true"
                    initial={reduced ? { scaleX: 1 } : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    sx={{
                        display: "block",
                        width: { xs: "5rem", md: "7rem" },
                        height: "4px",
                        backgroundColor: "secondary.main",
                        borderRadius: 2,
                        mt: 2,
                        transformOrigin: "center",
                    }}
                />
            )}

            {children}
        </Box>
    );
};

export default ParallaxSection;
