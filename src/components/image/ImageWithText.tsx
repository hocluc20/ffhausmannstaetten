import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Card, Chip } from '@mui/material';
import KindBadge from '../operations/KindBadge';
import { OperationKind } from '../../common/models/ICategory';

interface ImageWithTextProps {
    imageUrl?: string;
    title: string;
    text: string;
    link?: string;
    id: string;
    /** Optionales Datum, wird als Plakette oben links gezeigt. */
    date?: string;
    /** Einsatz oder Tätigkeit - erscheint als Abzeichen oben rechts. */
    kind?: OperationKind;
    height?: number | Record<string, number>;
}

/** Wird angezeigt, wenn ein Beitrag kein Bild hat. */
const FALLBACK_IMAGE = '/images/feuerwehrMannPlatzhalterKompremiertAuf300px.png';

const ImageWithText: React.FC<ImageWithTextProps> = ({
    imageUrl,
    title,
    text,
    id,
    date,
    kind,
    height,
}) => {
    return (
        <Card
            component={Link}
            to={`/taetigkeit/${id}`}
            sx={{
                position: 'relative',
                display: 'block',
                overflow: 'hidden',
                borderRadius: 2,
                textDecoration: 'none',
                height: height ?? { xs: 230, sm: 250, md: 270 },
                // Gueltiger Schattenwert: vorher stand hier eine komplette
                // CSS-Deklaration als Wert, die der Browser verworfen hat.
                boxShadow: '0 10px 30px rgba(26,22,20,.18)',
                transition: 'transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease',
                '&:hover, &:focus-visible': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 18px 44px rgba(26,22,20,.28)',
                },
                '&:hover .zoom, &:focus-visible .zoom': { transform: 'scale(1.09)' },
                '&:hover .bar, &:focus-visible .bar': { transform: 'scaleX(1)' },
                '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                    '&:hover, &:focus-visible': { transform: 'none' },
                    '& .zoom, & .bar': { transition: 'none' },
                },
            }}
        >
            <Box
                className="zoom"
                component="img"
                src={imageUrl || FALLBACK_IMAGE}
                alt={title || text || 'Beitragsbild'}
                loading="lazy"
                sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    backgroundColor: '#eceff1',
                    transition: 'transform .6s cubic-bezier(.22,1,.36,1)',
                }}
            />

            <Box
                aria-hidden="true"
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'linear-gradient(to top, rgba(26,22,20,.88) 0%, rgba(26,22,20,.45) 45%, rgba(26,22,20,.05) 100%)',
                }}
            />

            {/* Datum links, Art rechts - so bleibt beides auch auf schmalen
                Karten nebeneinander lesbar. */}
            {date && (
                <Chip
                    label={date}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        backgroundColor: 'rgba(255,255,255,.92)',
                        color: 'text.primary',
                        fontWeight: 600,
                    }}
                />
            )}

            {kind && (
                <KindBadge
                    kind={kind}
                    contrast
                    sx={{ position: 'absolute', top: 12, right: 12 }}
                />
            )}

            <Box
                sx={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    p: 2.25,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                }}
            >
                {title && (
                    <Typography
                        variant="overline"
                        sx={{ color: 'secondary.main', lineHeight: 1.4 }}
                    >
                        {title}
                    </Typography>
                )}
                {text && (
                    <Typography
                        variant="h6"
                        component="p"
                        sx={{
                            color: '#ffffff',
                            fontSize: { xs: '1.15rem', md: '1.3rem' },
                            lineHeight: 1.22,
                            textWrap: 'balance',
                        }}
                    >
                        {text}
                    </Typography>
                )}
                {/* Goldener Strich faehrt beim Hover aus. */}
                <Box
                    className="bar"
                    aria-hidden="true"
                    sx={{
                        mt: 0.75,
                        width: '3.5rem',
                        height: '3px',
                        borderRadius: 2,
                        backgroundColor: 'secondary.main',
                        transform: 'scaleX(0)',
                        transformOrigin: 'left',
                        transition: 'transform .4s cubic-bezier(.22,1,.36,1)',
                    }}
                />
            </Box>
        </Card>
    );
};

export default ImageWithText;
