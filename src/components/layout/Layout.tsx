import Footer from "../footer/Footer";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../header/Header";
import { Box } from "@mui/material";
import { motion, useReducedMotion } from "motion/react";
import Presence from "../motion/Presence";
import { useEffect } from "react";

/** Bei jedem Routenwechsel nach oben springen. */
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [pathname]);
    return null;
};

const Layout = () => {
    const location = useLocation();
    const reduced = useReducedMotion();

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <ScrollToTop />

            {/* Tastaturnutzer koennen die Navigation ueberspringen. */}
            <Box
                component="a"
                href="#inhalt"
                sx={{
                    position: "absolute",
                    left: "-9999px",
                    top: 0,
                    zIndex: 2000,
                    px: 2,
                    py: 1,
                    backgroundColor: "#ffffff",
                    color: "primary.dark",
                    fontWeight: 700,
                    borderRadius: "0 0 4px 0",
                    "&:focus": { left: 0, outline: "3px solid #ffd700" },
                }}
            >
                Zum Inhalt springen
            </Box>

            <Box
                component="header"
                sx={{ position: "sticky", top: 0, zIndex: 1100 }}
            >
                <Header />
            </Box>

            <Box component="main" id="inhalt" sx={{ flex: 1 }}>
                {/* Sanfter Uebergang zwischen den Seiten. */}
                <Presence mode="wait" initial={false}>
                    <motion.div
                        key={location.pathname}
                        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduced ? { opacity: 1 } : { opacity: 0, y: -8 }}
                        transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <Outlet />
                    </motion.div>
                </Presence>
            </Box>

            <Box component="footer">
                <Footer />
            </Box>
        </Box>
    );
};

export default Layout;
