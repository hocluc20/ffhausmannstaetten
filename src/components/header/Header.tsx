import React, { useEffect, useState } from "react";
import {
    AppBar,
    Toolbar,
    Box,
    IconButton,
    Button,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography,
    useTheme,
} from "@mui/material";
import { Menu as MenuIcon, Home, Info, Contacts, Build, Close, Gavel } from "@mui/icons-material";
import FireTruckIcon from "@mui/icons-material/FireTruck";
import { NavLink, Link as RouterLink } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { useAPI } from "../../common/context/DataContext";

const menuItems = [
    { text: "Home", icon: <Home />, link: "/" },
    { text: "Mannschaft", icon: <Info />, link: "/mannschaft" },
    { text: "Einsätze", icon: <Build />, link: "/einsaetzeUndTaetigkeiten" },
    { text: "Fahrzeuge", icon: <FireTruckIcon />, link: "/fahrzeuge" },
    { text: "Kontakt", icon: <Contacts />, link: "/kontakt" },
    { text: "Impressum", icon: <Gavel />, link: "/impressum" },
];

const Header: React.FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const theme = useTheme();
    const reduced = useReducedMotion();
    const { settings } = useAPI();

    // Ist die Mannschaftsseite im Adminbereich abgeschaltet, verschwindet
    // auch der Menüpunkt - sonst führte er auf eine 404-Seite.
    const visibleItems = menuItems.filter(
        (item) => item.link !== "/mannschaft" || settings.membersVisible
    );

    // Kompakter Header, sobald gescrollt wird.
    useEffect(() => {
        let frame: number | null = null;
        const onScroll = () => {
            if (frame !== null) return;
            frame = requestAnimationFrame(() => {
                frame = null;
                setScrolled(window.scrollY > 40);
            });
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            if (frame !== null) cancelAnimationFrame(frame);
        };
    }, []);

    const toggleDrawer = (open: boolean) => () => setDrawerOpen(open);

    return (
        <>
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    background: `linear-gradient(115deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 60%, #c33a3a 100%)`,
                    boxShadow: scrolled
                        ? "0 6px 26px rgba(0,0,0,.35)"
                        : "0 2px 12px rgba(0,0,0,.22)",
                    transition: "box-shadow .3s ease",
                    // Leicht angeschraegte Unterkante als Markenmotiv - nur dort,
                    // wo genug Flaeche vorhanden ist.
                    clipPath: {
                        xs: "none",
                        md: "polygon(0 0, 100% 0, 100% calc(100% - 22px), 0 100%)",
                    },
                    pb: { xs: 0, md: "22px" },
                }}
            >
                <Toolbar
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        minHeight: {
                            xs: scrolled ? 62 : 74,
                            md: scrolled ? 78 : 104,
                        },
                        transition: "min-height .3s ease",
                        px: { xs: 1.5, md: 3 },
                    }}
                >
                    <Box
                        component={RouterLink}
                        to="/"
                        aria-label="Zur Startseite"
                        sx={{ display: "inline-flex", alignItems: "center", mr: "auto" }}
                    >
                        <Box
                            component="img"
                            src="/01_logo_white.svg"
                            alt="Freiwillige Feuerwehr Hausmannstätten"
                            sx={{
                                height: {
                                    xs: scrolled ? "2.6rem" : "3.2rem",
                                    md: scrolled ? "3.4rem" : "4.6rem",
                                },
                                width: "auto",
                                transition: "height .3s ease",
                                borderBottom: `3px solid ${theme.palette.warning.main}`,
                                pb: "0.4rem",
                            }}
                        />
                    </Box>

                    <Box
                        component="nav"
                        aria-label="Hauptnavigation"
                        sx={{
                            display: { xs: "none", lg: "flex" },
                            gap: { lg: 0.75, xl: 1.5 },
                            alignItems: "center",
                        }}
                    >
                        {visibleItems.map((item) => (
                            <Button
                                key={item.text}
                                color="inherit"
                                component={NavLink}
                                to={item.link}
                                end={item.link === "/"}
                                sx={{
                                    position: "relative",
                                    overflow: "hidden",
                                    borderRadius: 1,
                                    px: { lg: 1.1, xl: 1.6 },
                                    fontSize: { lg: "0.98rem", xl: "1.05rem" },
                                    whiteSpace: "nowrap",
                                    "&::after": {
                                        content: '""',
                                        position: "absolute",
                                        bottom: 6,
                                        left: "12%",
                                        width: "76%",
                                        height: "2px",
                                        backgroundColor: theme.palette.warning.main,
                                        transform: "scaleX(0)",
                                        transformOrigin: "bottom right",
                                        transition: "transform .3s ease-out",
                                    },
                                    "&:hover::after, &.active::after": {
                                        transform: "scaleX(1)",
                                        transformOrigin: "bottom left",
                                    },
                                    "&:hover": { transform: "none", backgroundColor: "rgba(255,255,255,.08)" },
                                    "@media (prefers-reduced-motion: reduce)": {
                                        "&::after": { transition: "none" },
                                    },
                                }}
                            >
                                {item.text}
                            </Button>
                        ))}
                    </Box>

                    <IconButton
                        edge="end"
                        color="inherit"
                        aria-label="Menü öffnen"
                        aria-expanded={drawerOpen}
                        onClick={toggleDrawer(true)}
                        sx={{ display: { xs: "inline-flex", lg: "none" } }}
                    >
                        <MenuIcon sx={{ fontSize: "2rem" }} />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                PaperProps={{
                    sx: {
                        width: { xs: "82vw", sm: 320 },
                        maxWidth: 360,
                        background: `linear-gradient(160deg, ${theme.palette.error.dark} 0%, #4d0f0f 100%)`,
                        color: "#ffffff",
                    },
                }}
            >
                <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: 2,
                            py: 1.5,
                            borderBottom: `1px solid ${theme.palette.warning.main}`,
                        }}
                    >
                        <Typography variant="h6" component="p" sx={{ letterSpacing: "0.1em" }}>
                            MENÜ
                        </Typography>
                        <IconButton
                            onClick={toggleDrawer(false)}
                            aria-label="Menü schließen"
                            sx={{ color: "#ffffff" }}
                        >
                            <Close />
                        </IconButton>
                    </Box>

                    <List component="nav" aria-label="Hauptnavigation" sx={{ py: 1 }}>
                        {visibleItems.map((item, index) => (
                            <Box
                                key={item.text}
                                component={motion.div}
                                initial={reduced ? { opacity: 1 } : { opacity: 0, x: 24 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    duration: reduced ? 0 : 0.32,
                                    delay: reduced ? 0 : 0.05 + index * 0.06,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            >
                                <ListItem disablePadding>
                                    <ListItemButton
                                        component={NavLink}
                                        to={item.link}
                                        end={item.link === "/"}
                                        onClick={toggleDrawer(false)}
                                        sx={{
                                            py: 1.6,
                                            "&.active": {
                                                backgroundColor: "rgba(255,215,0,.16)",
                                                borderLeft: `4px solid ${theme.palette.warning.main}`,
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{ color: theme.palette.warning.main, minWidth: 44 }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.text}
                                            primaryTypographyProps={{ fontSize: "1.1rem", fontWeight: 500 }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </Box>
                        ))}
                    </List>

                    <Divider sx={{ background: theme.palette.warning.main, opacity: 0.5 }} />

                    <Box sx={{ mt: "auto", p: 2.5, opacity: 0.85 }}>
                        <Typography variant="body2">
                            Freiwillige Feuerwehr Hausmannstätten
                            <br />
                            Dorfstraße 15, 8071 Hausmannstätten
                        </Typography>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
};

export default Header;
