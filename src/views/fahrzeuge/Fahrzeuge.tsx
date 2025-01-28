import React, {useState, useEffect} from 'react';
import * as motion from 'motion/react-client';
import './Fahrzeuge.css';
import { AnimatePresence } from "motion/react"

const images = [
    {src: '/images/nobg/mzfa_closed.png', info: 'mzfa'},
    {src: '/images/nobg/tlfa_closed.png', info: 'tlfa'},
    {src: '/images/nobg/tsa_closed.png', info: 'tsa'},
    {src: '/images/nobg/krf_closed.png', info: 'krf'},
    {src: '/images/nobg/mtf_closed.png', info: 'mtf'},
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
                            <motion.img
                                key={index}
                                src={image.src}
                                alt={`Slide ${index}`}
                                initial={{x: '-100vw', opacity: 0}}
                                animate={{x: '0vw', opacity: 1}}
                                exit={{x: '100vw', opacity: 0}}
                                transition={{type: 'tween', duration: 0.8}}
                                className="carousel-image"
                            />
                        )
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Fahrzeuge;