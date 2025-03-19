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
        { text: "Tätigkeiten", icon: <Build />, link: "/einsaetzeUndTaetigkeiten" },
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
                    clipPath: {
                        lg: "polygon(86% 76%, 140% -17%, -3332% -855%)",
                        md: "polygon(86% 76%, 140% -17%, -3332% -855%)",
                    },
                    height: {
                        lg: "15rem",
                        md: "15rem",
                    },
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',  // Stronger shadow
                }}
            >
                <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>

                    <Box component="img" src="/01_logo_white.svg" alt="Freiwillige Feuerwehr Hausmannstätten" sx={{height: '7rem', marginTop: "0.4rem",
                        width: 'auto', borderBottom: `3px solid ${theme.palette.warning.main}`, paddingBottom: '0.5rem', marginRight: 'auto'}} />


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
                                sx={{
                                    fontWeight: "bold",
                                    position: "relative",
                                    overflow: "hidden",
                                    fontSize: "1.15rem",
                                    "&::after": {
                                        content: '""',
                                        position: "absolute",
                                        bottom: 0,
                                        left: "0%",
                                        width: "100%",
                                        height: "2px",
                                        backgroundColor: theme.palette.warning.main,
                                        transform: "scaleX(0)",
                                        transformOrigin: "bottom right",
                                        transition: "transform 0.3s ease-out",
                                    },
                                    "&:hover::after": {
                                        transform: "scaleX(1)",
                                        transformOrigin: "bottom left",
                                    },
                                }}
                                href={item.link}
                            >
                                {item.text}
                            </Button>
                        ))}
                    </Box>


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
