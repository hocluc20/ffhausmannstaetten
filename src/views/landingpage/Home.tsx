import React, {useEffect, useState} from 'react';
import {Box, Card, Container, Grid, Typography} from '@mui/material';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import SlideshowLandingPage from "../../components/slideshow/SlideshowLandingPage";
import ImageWithText from "../../components/image/ImageWithText";
import WelcomePopup from "../../components/popups/WelcomePopup";
import CountUp from "react-countup";
import { CardContent } from "@mui/material";
import FireTruckIcon from '@mui/icons-material/FireTruck';
import FireHydrantAltIcon from '@mui/icons-material/FireHydrantAlt';
import PersonIcon from '@mui/icons-material/Person';
import HeaderWithBackground from "../../components/header/HeaderWithBackground";
import {mockTaetigkeiten} from "../../mockdata/mockdata";



const stats = [
    { icon: <FireHydrantAltIcon sx={{fontSize:"5rem"}}/>, value: mockTaetigkeiten.filter(value => value.date.includes(new Date().getFullYear().toString())).length, label: "Einsätze" },
    { icon: <PersonIcon sx={{fontSize:"5rem"}}/>, value: 104, label: "Mitglieder" },
    { icon: <FireTruckIcon sx={{fontSize:"5rem"}}/>, value: 4, label: "Fahrzeuge" },
];

const Home: React.FC = () => {
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
                            <Box sx={{color:"#B32B2B"}}>
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

            <HeaderWithBackground headerText={"Neuigkeiten"} headerSize={"h1"} imageName={"sam_3937.jpg"} polygon={"polygon(18% 0%, 121% 26%, 134% 1%, 73% 97%, -17% 65%, -13% 27%)"} heightInRem={20}/>

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

                {mockTaetigkeiten.slice(0, 3).map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index + 3}>
                        <ImageWithText
                            text={item.title}
                            title={item.alarmstichwort}
                            imageUrl={item.photos[0]}
                            link={""}
                            id={item.id}
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
                {mockTaetigkeiten.slice(3, 6).map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index + 3}>
                        <ImageWithText
                            text={item.title}
                            title={item.alarmstichwort}
                            imageUrl={item.photos[0]}
                            link={""}
                            id={item.id}
                            />
                    </Grid>
                ))}
                <Grid item xs={false} sm={1.4} md={1.4}></Grid>
            </Grid>
        </Box>
    );
};

export default Home;
