import React, {useEffect, useState} from 'react';
import { Box } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import SlideshowLandingPage from "../../components/slideshow/SlideshowLandingPage";
import {ParallaxBanner, ParallaxProvider} from "react-scroll-parallax";



const Home: React.FC = () => {
    return (
        <SlideshowLandingPage/>
    );

};

export default Home;
