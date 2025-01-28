import React, {useEffect, useState} from 'react';
import {Box, Container, Grid} from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import SlideshowLandingPage from "../../components/slideshow/SlideshowLandingPage";
import {ParallaxBanner, ParallaxProvider} from "react-scroll-parallax";
import HeaderWithBackground from "../../components/header/HeaderWithBackground";
import ImageWithText from "../../components/image/ImageWithText";
import WelcomePopup from "../../components/popups/WelcomePopup";
import ProfileCard from "../../components/mitglieder/ProfileCard";


const Home: React.FC = () => {
    // TO-DO: Get immer die 3 aktuellsten Ereignisse
    return (
        <Box sx={{width: "100%", maxWidth: "100%"}}>
            <WelcomePopup/>

            <SlideshowLandingPage/>
            <br/>

            {/*<Box*/}
            {/*    sx={{*/}
            {/*        position: 'fixed',*/}
            {/*        zIndex: -1,*/}
            {/*        height: '100vh',*/}
            {/*        width: '100%',*/}
            {/*        top: 0,*/}
            {/*        left: 0,*/}
            {/*        backgroundImage: "url('/images/FFHausMitAutos.jpg')",*/}
            {/*        backgroundSize: 'cover',*/}
            {/*        backgroundPosition: 'center',*/}
            {/*        backgroundRepeat: 'no-repeat',*/}
            {/*    }}*/}
            {/*/>*/}

            {/*<HeaderWithBackground headerText={"Einsätze"}/>*/}
            <Grid container spacing={4} sx={{
                justifyContent: 'center',
                width: '105%',
                paddingBottom: "2rem",
                paddingTop: "2rem",
                marginTop: "10rem",
                marginBottom: "10rem",
                backgroundColor: "white"
            }}>

                <Grid item xs={12} sm={3} md={3}>
                    <ImageWithText
                        text="Verkehrsunfall"
                        title="T03V"
                        imageUrl="/images/FFHausMitAutos.jpg"
                        link={"impressum"}
                    />
                </Grid>
                <Grid item xs={12} sm={3} md={3}>
                    <ImageWithText
                        text="Verkehrsunfall"
                        title="T03V"
                        imageUrl="/images/FFHausMitAutos.jpg"
                        link={"impressum"}
                    />
                </Grid>
                <Grid item xs={12} sm={3} md={3}>
                    <ImageWithText
                        text="Verkehrsunfall"
                        title="T03V"
                        imageUrl="/images/FFHausMitAutos.jpg"
                        link={"impressum"}
                    />
                </Grid>
                <Grid item xs={12} sm={1.4} md={1.4}>

                </Grid>
            </Grid>

            <Grid container spacing={4} sx={{justifyContent: 'center', width: '100%'}}>
                <Grid item xs={12} sm={1.4} md={1.4}>

                </Grid>
                <Grid item xs={12} sm={3} md={3}>
                    <ImageWithText
                        text="Verkehrsunfall"
                        title="T03V"
                        imageUrl="/images/FFHausMitAutos.jpg"
                        link={"impressum"}
                    />
                </Grid>
                <Grid item xs={12} sm={3} md={3}>
                    <ImageWithText
                        text="Verkehrsunfall"
                        title="T03V"
                        imageUrl="/images/FFHausMitAutos.jpg"
                        link={"impressum"}
                    />
                </Grid>
                <Grid item xs={12} sm={3} md={3}>
                    <ImageWithText
                        text="Verkehrsunfall"
                        title="T03V"
                        imageUrl="/images/FFHausMitAutos.jpg"
                        link={"impressum"}
                    />
                </Grid>
                <Grid item xs={12} sm={1.4} md={1.4}>

                </Grid>
            </Grid>


        </Box>
    );

};

export default Home;
