import React, {Suspense, lazy} from 'react';
import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Box, CircularProgress, ThemeProvider} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";

import Layout from "./components/layout/Layout";
import {APIProvider} from "./common/context/DataContext";
import CookiePopup from "./components/popups/CookiePopup";
import ErrorBoundary from "./components/feedback/ErrorBoundary";

// Routen werden einzeln nachgeladen, damit nicht jede Seite das gesamte
// Bundle (Karussell, Tabelle, Animationen) mitbringt.
const Home = lazy(() => import("./views/landingpage/Home"));
const Impressum = lazy(() => import("./views/impressum/Impressum"));
const Mitglieder = lazy(() => import("./views/mitglieder/Mitglieder"));
const Fahrzeuge = lazy(() => import("./views/fahrzeuge/Fahrzeuge"));
const FahrzeugDetail = lazy(() => import("./views/fahrzeuge/FahrzeugDetail"));
const Kontakt = lazy(() => import("./views/kontakt/Kontakt"));
const Taetigkeiten = lazy(() => import("./views/taetigkeiten/Taetigkeiten"));
const TaetigkeitDetailedView = lazy(() => import("./views/taetigkeit/TaetigkeitDetailedView"));
const NotFound = lazy(() => import("./views/notfound/NotFound"));

const RouteFallback = () => (
    <Box sx={{display: "flex", justifyContent: "center", py: 12}}>
        <CircularProgress aria-label="Seite wird geladen"/>
    </Box>
);

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <ErrorBoundary>
                <APIProvider>
                    <BrowserRouter>
                        <CookiePopup/>
                        <Suspense fallback={<RouteFallback/>}>
                            <Routes>
                                <Route path="/" element={<Layout/>}>
                                    <Route index element={<Home/>}/>
                                    <Route path="impressum" element={<Impressum/>}/>
                                    <Route path="mannschaft" element={<Mitglieder/>}/>
                                    <Route path="fahrzeuge" element={<Fahrzeuge/>}/>
                                    <Route path="fahrzeuge/:slug" element={<FahrzeugDetail/>}/>
                                    <Route path="kontakt" element={<Kontakt/>}/>
                                    <Route path="einsaetzeUndTaetigkeiten" element={<Taetigkeiten/>}/>
                                    <Route path="taetigkeit/:id" element={<TaetigkeitDetailedView/>}/>
                                    <Route path="*" element={<NotFound/>}/>
                                </Route>
                            </Routes>
                        </Suspense>
                    </BrowserRouter>
                </APIProvider>
            </ErrorBoundary>
        </ThemeProvider>
    );
}

export default App;
