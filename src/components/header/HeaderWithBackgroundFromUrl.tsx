/**
 * author: simon
 * date: 19.03.2025
 * project: ffhausmannstaetten
 * package_name:
 **/

import React from 'react';
import ParallaxSection from './ParallaxSection';

const FALLBACK_IMAGE = "sam_3937.jpg";

/**
 * Wie HeaderWithBackground, aber mit einer vollstaendigen Bild-URL
 * (z. B. aus der WordPress-Mediathek).
 */
const HeaderWithBackgroundUrl: React.FC<{
    headerText: string;
    headerSize: string;
    imageName?: string;
    eyebrow?: string;
    polygon?: string;
    heightInRem?: number;
}> = ({ headerText, headerSize, imageName, eyebrow, polygon, heightInRem }) => {
    // Ohne Guard stand hier bei fehlendem Bild url("undefined") bzw. url("false").
    const hasUrl = Boolean(imageName && imageName.trim());

    return (
        <ParallaxSection
            image={hasUrl ? (imageName as string) : FALLBACK_IMAGE}
            absoluteUrl={hasUrl}
            headerText={headerText}
            headerSize={(headerSize as "h1" | "h2" | "h3" | "h4") ?? "h2"}
            eyebrow={eyebrow}
            polygon={polygon}
            heightInRem={heightInRem ?? 15}
        />
    );
};

export default HeaderWithBackgroundUrl;
