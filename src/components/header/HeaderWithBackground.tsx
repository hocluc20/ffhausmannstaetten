import React from 'react';
import ParallaxSection from './ParallaxSection';

/**
 * Abschnittsueberschrift mit stehendem Hintergrundbild aus /images.
 * Duenne Huelle um ParallaxSection, damit alle bestehenden Aufrufe den
 * neuen Effekt bekommen.
 */
const HeaderWithBackground: React.FC<{
    headerText: string;
    headerSize: string;
    imageName: string;
    eyebrow?: string;
    polygon?: string;
    heightInRem?: number;
}> = ({ headerText, headerSize, imageName, eyebrow, polygon, heightInRem }) => (
    <ParallaxSection
        image={imageName}
        headerText={headerText}
        headerSize={(headerSize as "h1" | "h2" | "h3" | "h4") ?? "h2"}
        eyebrow={eyebrow}
        polygon={polygon}
        heightInRem={heightInRem ?? 15}
    />
);

export default HeaderWithBackground;
