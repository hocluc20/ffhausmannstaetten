import { createTheme } from "@mui/material/styles";

const DISPLAY = '"Barlow Condensed", "Arial Narrow", Arial, sans-serif';
const BODY = '"Barlow", "Helvetica Neue", Arial, sans-serif';

/** Rot der Feuerwehr, Gold als Akzent, warme Neutraltoene dazwischen. */
export const brand = {
    red: "#b32b2b",
    redDark: "#751616",
    redLight: "#e57373",
    gold: "#ffd700",
    goldDeep: "#a97c0a",
    ink: "#1a1614",
    inkSoft: "#4a3e39",
    muted: "#6f625c",
    line: "#e4dbd6",
    surface: "#ffffff",
    ground: "#f7f4f2",
};

/**
 * Hintergrund der Seite.
 *
 * Drei sehr flache Ebenen statt einer Bilddatei: zwei weiche Lichtkegel in
 * den Markenfarben und ein feines diagonales Raster. Zusammen ergibt das
 * Struktur, ohne dass Text darauf schwerer lesbar wird - die Kontraste
 * bleiben unter 3 % Abweichung vom Grundton, Karten liegen ohnehin auf
 * Weiß. Kostet keinen einzigen Request.
 */
export const pageBackground = {
    backgroundColor: brand.ground,
    backgroundImage: [
        "radial-gradient(58rem 40rem at 12% -8%, rgba(179,43,43,.055), transparent 60%)",
        "radial-gradient(46rem 34rem at 105% 8%, rgba(255,215,0,.06), transparent 62%)",
        "repeating-linear-gradient(135deg, rgba(26,22,20,.017) 0 1px, transparent 1px 9px)",
    ].join(", "),
    backgroundAttachment: "fixed, fixed, scroll",
};

const theme = createTheme({
    palette: {
        primary: {
            main: brand.red,
            dark: brand.redDark,
            light: brand.redLight,
            contrastText: "#ffffff",
        },
        secondary: { main: brand.gold, contrastText: brand.ink },
        error: { main: brand.red },
        warning: { main: brand.gold, contrastText: brand.ink },
        text: {
            // Vorher stand hier "#ffffff" auf hellem Grund - weiss auf weiss.
            primary: brand.ink,
            secondary: brand.muted,
        },
        background: { default: brand.ground, paper: brand.surface },
        divider: brand.line,
    },

    shape: { borderRadius: 10 },

    typography: {
        fontFamily: BODY,
        // Ueberschriften in der schmalen Schnitte, leicht gesperrt.
        h1: { fontFamily: DISPLAY, fontWeight: 700, letterSpacing: "0.01em", lineHeight: 1.02 },
        h2: { fontFamily: DISPLAY, fontWeight: 700, letterSpacing: "0.01em", lineHeight: 1.08 },
        h3: { fontFamily: DISPLAY, fontWeight: 600, letterSpacing: "0.01em", lineHeight: 1.12 },
        h4: { fontFamily: DISPLAY, fontWeight: 600, lineHeight: 1.18 },
        h5: { fontFamily: DISPLAY, fontWeight: 600, lineHeight: 1.22 },
        h6: { fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.25rem", letterSpacing: "0.02em" },
        subtitle1: { fontWeight: 500 },
        button: {
            fontFamily: DISPLAY,
            fontWeight: 600,
            letterSpacing: "0.06em",
            fontSize: "1rem",
        },
        body1: { fontSize: "1.02rem", lineHeight: 1.65 },
        body2: { fontSize: "0.94rem", lineHeight: 1.55 },
        overline: {
            fontFamily: DISPLAY,
            fontWeight: 600,
            letterSpacing: "0.18em",
            fontSize: "0.8rem",
        },
    },

    components: {
        MuiCssBaseline: {
            styleOverrides: {
                html: { scrollBehavior: "smooth" },
                "@media (prefers-reduced-motion: reduce)": {
                    html: { scrollBehavior: "auto" },
                    "*, *::before, *::after": {
                        animationDuration: "0.001ms !important",
                        animationIterationCount: "1 !important",
                        transitionDuration: "0.001ms !important",
                    },
                },
                body: { ...pageBackground, overflowX: "hidden" },
                "::selection": { background: brand.gold, color: brand.ink },
            },
        },
        MuiButtonBase: {
            styleOverrides: {
                root: {
                    "&.Mui-focusVisible": {
                        outline: `3px solid ${brand.gold}`,
                        outlineOffset: "2px",
                    },
                },
            },
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    borderRadius: 999,
                    paddingInline: "1.5rem",
                    textTransform: "uppercase",
                    transition: "transform .18s ease, box-shadow .18s ease, background-color .18s ease",
                    "&:hover": { transform: "translateY(-2px)" },
                    "@media (prefers-reduced-motion: reduce)": {
                        transition: "none",
                        "&:hover": { transform: "none" },
                    },
                },
                containedPrimary: {
                    boxShadow: "0 6px 18px rgba(179,43,43,.28)",
                    "&:hover": { boxShadow: "0 10px 24px rgba(179,43,43,.36)" },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: { backgroundImage: "none" },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { fontFamily: DISPLAY, fontWeight: 600, letterSpacing: "0.06em" },
            },
        },
        MuiLink: {
            styleOverrides: {
                root: {
                    "&:focus-visible": {
                        outline: `3px solid ${brand.gold}`,
                        outlineOffset: "2px",
                    },
                },
            },
        },
    },
});

export default theme;
