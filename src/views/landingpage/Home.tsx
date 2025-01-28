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


interface MockDataItem {
    text: string;
    title: string;
    imageUrl: string;
    link: string;
}

// Mock data for the grids
const mockDataPrimary: MockDataItem[] = [
    {
        text: "Verkehrsunfall",
        title: "T03V",
        imageUrl: "/images/FFHausMitAutos.jpg",
        link: "impressum",
    },
    {
        text: "Brandbekämpfung",
        title: "B02B",
        imageUrl: "/images/FFHausMitAutos.jpg",
        link: "services",
    },
    {
        text: "Technische Hilfe",
        title: "T01T",
        imageUrl: "/images/FFHausMitAutos.jpg",
        link: "contact",
    },
];

const Home: React.FC = () => {
    // TO-DO: Get immer die 3 aktuellsten Ereignisse
    return (
        <Box sx={{width: "100%", maxWidth: "100%", alignItems:"center"}}>
            <WelcomePopup/>

            <SlideshowLandingPage/>
            {/*<br/>*/}

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
            <Grid container spacing={5} sx={{
                justifyContent: 'center',
                width: '100%',
                paddingBottom: "2rem",
                paddingTop: "2vh",
                marginTop: "10vh",
                marginBottom: "10rem",
                backgroundColor: "white",
                // alignItems:"center"
            }}>
                <Grid item xs={12} sm={1.4} md={1.4}>

                </Grid>

                <Grid item xs={12} sm={5} md={3}>
                    <ImageWithText
                        text="Verkehrsunfall"
                        title="T03V"
                        imageUrl="/images/FFHausMitAutos.jpg"
                        link={"impressum"}
                    />
                </Grid>
                <Grid item xs={12} sm={5} md={3}>
                    <ImageWithText
                        text="Verkehrsunfall"
                        title="T03V"
                        imageUrl="/images/FFHausMitAutos.jpg"
                        link={"impressum"}
                    />
                </Grid>
                <Grid item xs={12} sm={5} md={3}>
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



            <Grid
                container
                spacing={5}
                sx={{
                    justifyContent: 'center',
                    width: '100%',
                    paddingBottom: "2rem",
                    paddingTop: "2rem",
                    marginTop: { xs: "5rem", md: "10rem" },
                    marginBottom: { xs: "5rem", md: "10rem" },
                    backgroundColor: "white",
                }}
            >
                <Grid item xs={false} sm={1.4} md={1.4}></Grid>

                {mockDataPrimary.map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <ImageWithText
                            text={item.text}
                            title={item.title}
                            imageUrl={item.imageUrl}
                            link={item.link}
                        />
                    </Grid>
                ))}

                <Grid item xs={false} sm={1.4} md={1.4}></Grid>

            </Grid>


        </Box>
    );

};

export default Home;
