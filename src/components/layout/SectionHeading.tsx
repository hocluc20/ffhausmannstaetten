import React from "react";
import { Box, Typography } from "@mui/material";
import { motion, useReducedMotion } from "motion/react";

interface SectionHeadingProps {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    align?: "left" | "center";
}

/** Wiederkehrender Abschnittskopf: Kleinzeile, Titel, goldener Strich. */
const SectionHeading: React.FC<SectionHeadingProps> = ({
    eyebrow,
    title,
    subtitle,
    align = "center",
}) => {
    const reduced = useReducedMotion();
    const rise = reduced ? { opacity: 1 } : { opacity: 0, y: 18 };

    return (
        <Box
            sx={{
                textAlign: align,
                mb: { xs: 3.5, md: 5 },
                display: "flex",
                flexDirection: "column",
                alignItems: align === "center" ? "center" : "flex-start",
                // Ohne maxWidth waechst ein Flex-Kind bei alignItems:center auf
                // seine max-content-Breite und schiebt die Seite seitlich raus.
                "& > *": { maxWidth: "100%" },
            }}
        >
            {eyebrow && (
                <Typography
                    variant="overline"
                    component={motion.p}
                    initial={rise}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5 }}
                    sx={{ color: "primary.main" }}
                >
                    {eyebrow}
                </Typography>
            )}

            <Typography
                variant="h2"
                component={motion.h2}
                initial={rise}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                sx={{
                    fontSize: { xs: "2rem", sm: "2.4rem", md: "2.9rem" },
                    color: "text.primary",
                    textWrap: "balance",
                }}
            >
                {title}
            </Typography>

            <Box
                component={motion.span}
                aria-hidden="true"
                initial={reduced ? { scaleX: 1 } : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                sx={{
                    display: "block",
                    width: "4.5rem",
                    height: "4px",
                    borderRadius: 2,
                    backgroundColor: "secondary.main",
                    mt: 1.5,
                    transformOrigin: align === "center" ? "center" : "left",
                }}
            />

            {subtitle && (
                <Typography
                    component={motion.p}
                    initial={rise}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.55, delay: 0.18 }}
                    sx={{
                        mt: 2,
                        maxWidth: "58ch",
                        color: "text.secondary",
                        fontSize: { xs: "1rem", md: "1.08rem" },
                    }}
                >
                    {subtitle}
                </Typography>
            )}
        </Box>
    );
};

export default SectionHeading;
