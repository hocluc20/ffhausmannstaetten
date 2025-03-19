import React from 'react';
import './App.css';
import {BrowserRouter, Route, Routes} from "react-router";
import Layout from "./components/layout/Layout";
import {ThemeProvider} from "@mui/material";
import theme from "./theme";

import {APIProvider, useAPI} from "./common/context/DataContext";
import Impressum from "./views/impressum/Impressum";
import CookiePopup from "./components/popups/CookiePopup";
import Home from "./views/landingpage/Home";
import Mitglieder from "./views/mitglieder/Mitglieder";
import Fahrzeuge from "./views/fahrzeuge/Fahrzeuge";
import Taetigkeiten from "./views/taetigkeiten/Taetigkeiten";
import TaetigkeitDetailedView from "./views/taetigkeit/TaetigkeitDetailedView";
import {mockTaetigkeiten} from "./mockdata/mockdata";


function App() {


    return (
        <>
            <APIProvider>
                <ThemeProvider theme={theme}>
                    <BrowserRouter>
                        <CookiePopup/>
                        <Routes>
                            <Route path="/" element={<Layout/>}>
                                  {<Route path={"/"} element={<Home/>}/>}
                                  <Route path="/impressum" element={<Impressum/>}/>
                                  <Route path="/mannschaft" element={<Mitglieder/>}/>
                                  <Route path="/fahrzeuge" element={<Fahrzeuge/>}/>
                                  <Route path="/einsaetzeUndTaetigkeiten" element={<Taetigkeiten/>}/>
                                <Route
                                    path="/taetigkeit/:id"
                                    element={<TaetigkeitDetailedView />}
                                />
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </ThemeProvider>
            </APIProvider>
        </>
    );
}

export default App;
