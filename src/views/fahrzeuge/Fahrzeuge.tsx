import React, {useState, useEffect} from 'react';
import * as motion from 'motion/react-client';
import './Fahrzeuge.css';
import {AnimatePresence} from "motion/react";
import {List, ListItem, Typography} from "@mui/material";

const images = [
    {src: '/images/nobg/tlfa_closed.png', info: 'TLFA', description:'3000l Wasser;200l Schaum;400PS;2013 erbaut;5+1 Sitze'},
    {src: '/images/nobg/krf_closed.png', info: 'KRFS-T', description:'3000l Wasser;200l Schaum;400PS;2013 erbaut;5+1 Sitze'},
    {src: '/images/nobg/mzfa_closed.png', info: 'MZFA', description:'3000l Wasser;200l Schaum;400PS;2013 erbaut;5+1 Sitze'},
    {src: '/images/nobg/mtf_closed.png', info: 'MTF', description:'3000l Wasser;200l Schaum;400PS;2013 erbaut;5+1 Sitze'},
    {src: '/images/nobg/tsa_closed.png', info: 'TSA', description:'3000l Wasser;200l Schaum;400PS;2013 erbaut;5+1 Sitze'}
];

const Fahrzeuge = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleScroll = () => {
        const scrollY = window.scrollY;
        const scrollRange = document.body.scrollHeight - window.innerHeight;
        const sectionHeight = scrollRange / images.length;
        const newIndex = Math.min(
            Math.max(Math.floor(scrollY / sectionHeight), 0),
            images.length - 1
        );
        setCurrentIndex(newIndex);
    };

    useEffect(() => {
        // Preload all images
        images.forEach((image) => {
            const img = new Image();
            img.src = image.src;
        });

        // Attach scroll listener
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="fahrzeuge-container">
            <div className="background"></div>

            <div className="carousel">
                <AnimatePresence mode="wait">
                    {images.map((image, index) => (
                        index === currentIndex && (
                            <motion.div key={index} className={"carousel-container"}>
                                <motion.img
                                    src={image.src}
                                    alt={`Slide ${index}`}
                                    initial={{x: '-100vw', opacity: 0}}
                                    animate={{x: '0vw', opacity: 1}}
                                    exit={{x: '100vw', opacity: 0}}
                                    transition={{type: 'tween', duration: 0.4}}
                                    className="carousel-image"
                                />
                                <motion.div initial={{x: '-100vw', opacity: 0}}
                                            animate={{x: '0vw', opacity: 1}}
                                            exit={{x: '100vw', opacity: 0}}
                                            transition={{type: 'tween', duration: 0.4}}
                                            className="carousel-text">
                                    <Typography variant="h3">{image.info}</Typography>
                                    <List>
                                        {image.description.split(";").map((value, index) => (
                                            <ListItem key={index}>
                                                <Typography variant="h5">{value}</Typography>
                                            </ListItem>
                                        ))}
                                    </List>
                                </motion.div>

                            </motion.div>
                        )
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Fahrzeuge;
