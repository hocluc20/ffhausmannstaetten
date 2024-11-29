import React from 'react';
import './App.css';
import {BrowserRouter, Route, Routes} from "react-router";
import Layout from "./components/layout/Layout";
import {ThemeProvider} from "@mui/material";
import theme from "./theme";

import {APIProvider, useAPI} from "./common/context/DataContext";

function App() {


    return (
        <>
            <APIProvider>
                <ThemeProvider theme={theme}>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Layout/>}>
                                {/*  {<Route index element={<Overview/>}/>}*/}
                                {/*  <Route path="/users" element={<Userview/>}/>*/}
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </ThemeProvider>
            </APIProvider>
        </>
    );
}

export default App;
