import React, { useState } from "react";
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
    useTheme,
    Typography,
} from "@mui/material";
import { Menu as MenuIcon, Home, Info, Contacts, Build } from "@mui/icons-material";
import FireTruckIcon from '@mui/icons-material/FireTruck';

const Header: React.FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();

    // Handler zum Öffnen und Schließen des Drawers
    const toggleDrawer = (open: boolean) => () => {
        setDrawerOpen(open);
    };

    // Menüelemente
    const menuItems = [
        { text: "Home", icon: <Home />, link: "/" },
        { text: "Mitglieder", icon: <Info />, link: "/mannschaft" },
        { text: "Einsätze & Tätigkeiten", icon: <Build />, link: "/einsaetzeUndTaetigkeiten" },
        // { text: "Tätigkeiten", icon: <Build />, link: "#" },
        { text: "Kontakt & Impressum", icon: <Contacts />, link: "/impressum" },
        { text: "Fahrzeuge", icon: <FireTruckIcon/>, link: "/fahrzeuge" },
    ];

    return (
        <>
            {/* Header */}
            <AppBar
                position="static"
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
                }}
            >
                <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* Titel / Logo */}
                    <img
                        src="/LogoLaptop.png"
                        alt="Freiwillige Feuerwehr Hausmannstätten"
                        style={{
                            height: '80px',
                            width: 'auto',
                            borderBottom: `3px solid ${theme.palette.warning.main}`,
                            paddingBottom: '0.5rem',
                            marginRight: 'auto',
                        }}
                    />

                    {/* Navigation Links (nur für größere Bildschirme sichtbar) */}
                    <Box
                        sx={{
                            display: { xs: "none", sm: "flex" },
                            gap: 2,
                            justifyContent: "center",
                            alignItems: "center",
                            flexGrow: 1,
                        }}
                    >
                        {menuItems.map((item) => (
                            <Button
                                key={item.text}
                                color="inherit"
                                sx={{ fontWeight: "bold" }}
                                href={item.link}
                            >
                                {item.text}
                            </Button>
                        ))}
                    </Box>

                    {/* Menü-Icon (nur auf mobilen Geräten sichtbar) */}
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={toggleDrawer(true)}
                        sx={{
                            mr: 2,
                            display: { xs: "block", sm: "none" },
                            position: 'absolute', // Positioniert das Icon absolut im AppBar
                            right: '20px', // Abstand vom rechten Rand
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Seitliches Menü (Drawer) rechts */}
            <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
                <Box
                    sx={{
                        width: 250,
                        background: theme.palette.error.dark,
                        color: "white",
                        height: "100%",
                    }}
                    role="presentation"
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                >
                    {/* Überschrift im Drawer */}
                    <Typography
                        variant="h6"
                        sx={{
                            textAlign: "center",
                            fontWeight: "bold",
                            py: 2,
                            borderBottom: `1px solid ${theme.palette.warning.main}`,
                        }}
                    >
                        Menü
                    </Typography>

                    {/* Menüelemente */}
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton component="a" href={item.link}>
                                    <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>

                    <Divider sx={{ background: theme.palette.warning.main }} />
                </Box>
            </Drawer>
        </>
    );
};

export default Header;
