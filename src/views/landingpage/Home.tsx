import React, {useEffect, useState} from 'react';
import {Box, Card, Container, Grid, Typography} from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import SlideshowLandingPage from "../../components/slideshow/SlideshowLandingPage";
import {ParallaxBanner, ParallaxProvider} from "react-scroll-parallax";
import HeaderWithBackground from "../../components/header/HeaderWithBackground";
import ImageWithText from "../../components/image/ImageWithText";
import WelcomePopup from "../../components/popups/WelcomePopup";
import ProfileCard from "../../components/mitglieder/ProfileCard";
import CountUp from "react-countup";
import { CardContent } from "@mui/material";
import { Bell, Users, Truck } from "lucide-react";


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
        title: "B02",
        imageUrl: "/images/FFHausMitAutos.jpg",
        link: "services",
    },
    {
        text: "Technische Hilfe",
        title: "T01",
        imageUrl: "/images/FFHausMitAutos.jpg",
        link: "contact",
    },
    {
        text: "Hochwasser",
        title: "H01",
        imageUrl: "/images/FFHausMitAutos.jpg",
        link: "flood-info",
    },
    {
        text: "Tierrettung",
        title: "T02",
        imageUrl: "/images/FFHausMitAutos.jpg",
        link: "animal-rescue",
    },
    {
        text: "Gefahrgutunfall",
        title: "G01",
        imageUrl: "/images/FFHausMitAutos.jpg",
        link: "hazmat-info",
    }
];

const stats = [
    { icon: <Bell size={60} color="#b32b2b" />, value: mockDataPrimary.length, label: "Einsätze" },
    { icon: <Users size={60} color="#b32b2b" />, value: 104, label: "Mitglieder" },
    { icon: <Truck size={60} color="#b32b2b" />, value: 4, label: "Fahrzeuge" },
];

const Home: React.FC = () => {
    // TO-DO: Get immer die 3 aktuellsten Ereignisse
    return (
        <Box sx={{width: "100%", maxWidth: "100%", alignItems:"center"}}>
            <WelcomePopup/>

            <SlideshowLandingPage/>


            <Grid container justifyContent="center" alignItems="center" spacing={4} sx={{ py: 5 }}>
                {stats.map((stat, index) => (
                    <Grid item key={index}>
                        <Card
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                p: 4,
                                minWidth: 300,
                                boxShadow: "none",
                            }}
                        >
                            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box>
                                {stat.icon}
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" color="#000000">
                                    <CountUp start={0} end={stat.value} duration={4.5} />
                                </Typography>
                                <Typography variant="subtitle1" color="#000000">
                                    {stat.label}
                                </Typography>
                            </Box>
                        </CardContent>

                        </Card>
                    </Grid>
                ))}
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
                    backgroundColor: "white",
                }}
            >
                <Grid item xs={false} sm={1.4} md={1.4}></Grid>

                {mockDataPrimary.slice(0, 3).map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index + 3}>
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

            <Grid
                container
                spacing={5}
                sx={{
                    justifyContent: 'center',
                    width: '100%',
                    paddingBottom: "2rem",
                    paddingTop: "2rem",
                    marginBottom: { xs: "5rem", md: "10rem" },
                    backgroundColor: "white",
                }}
            >
                <Grid item xs={false} sm={1.4} md={1.4}></Grid>

                {mockDataPrimary.slice(3, 6).map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index + 3}>
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
