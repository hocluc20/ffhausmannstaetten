import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#b32b2b", // Hauptfarbe für Buttons, Links, etc.
            dark: "#751616", // Dunklere Akzente
            light: "#e57373", // Hellerer Ton für Hover
        },
        secondary: {
            main: "#ffd700", // Goldener Farbton
        },
        error: {
            main: "#b32b2b",
        },
        warning: {
            main: "#ffd700",
        },
        text: {
            primary: "#ffffff", // Standard-Textfarbe
            secondary: "#cccccc", // Sekundärtext
        },
        background: {
            default: "#f7f7f7", // Seitenhintergrund
            paper: "#ffffff", // Hintergründe von Cards, Dialogen, etc.
        },
    },
    typography: {
        fontFamily: "Arial, sans-serif",
        h6: {
            fontWeight: 600, // Überschriften fett darstellen
            fontSize: "1.2rem",
        },
        body1: {
            fontSize: "1rem",
            lineHeight: 1.6,
        },
        body2: {
            fontSize: "0.9rem",
            lineHeight: 1.5,
        },
    },
});

export default theme;
