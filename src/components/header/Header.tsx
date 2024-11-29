import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
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
} from "@mui/material";
import { Menu as MenuIcon, Home, Info, Contacts, Build } from "@mui/icons-material";

const Header: React.FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();

    // Handler zum Öffnen und Schließen des Drawers
    const toggleDrawer = (open: boolean) => () => {
        setDrawerOpen(open);
    };

    // Menüelemente
    const menuItems = [
        { text: "Startseite", icon: <Home />, link: "#" },
        { text: "Über Uns", icon: <Info />, link: "#" },
        { text: "Einsätze", icon: <Build />, link: "#" },
        { text: "Kontakt", icon: <Contacts />, link: "#" },
        { text: "Impressum", icon: <Contacts />, link: "#" },
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
                <Toolbar>
                    {/* Menü-Icon (für mobile Navigation) */}
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={toggleDrawer(true)}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Titel / Logo */}
                    {/*<Typography*/}
                    {/*    variant="h6"*/}
                    {/*    component="div"*/}
                    {/*    sx={{*/}
                    {/*        flexGrow: 1,*/}
                    {/*        fontWeight: "bold",*/}
                    {/*        borderBottom: `3px solid ${theme.palette.warning.main}`,*/}
                    {/*        pb: 0.5,*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    Freiwillige Feuerwehr Hausmannstätten*/}
                    {/*</Typography>*/}

                    <img
                        src="/LogoLaptop.png"  // Bild aus dem 'public' Ordner direkt ansprechen
                        alt="Freiwillige Feuerwehr Hausmannstätten"
                        style={{
                            height: '80px',
                            width: 'auto',
                            borderBottom: `3px solid ${theme.palette.warning.main}`,
                            paddingBottom: '0.5rem',
                            marginRight: '250px'
                        }}
                    />


                    {/* Navigation Links (nur für größere Bildschirme sichtbar) */}
                    <Box
                        sx={{
                            display: {xs: "none", sm: "flex"},
                            gap: 2,
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
                </Toolbar>
            </AppBar>

            {/* Seitliches Menü (Drawer) */}
            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
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
