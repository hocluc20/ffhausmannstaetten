import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface ProfileCardProps {
    name: string;
    rank: string;
    function: string;
    imageUrl: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
    name,
    rank,
    function: userFunction,
    imageUrl,
}) => {
    return (
        <Card
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 6px 20px rgba(26,22,20,.07)',
                transition: 'transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s ease',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 16px 36px rgba(26,22,20,.15)',
                },
                '&:hover .portrait': { transform: 'scale(1.06)' },
                '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                    '&:hover': { transform: 'none' },
                    '& .portrait': { transition: 'none' },
                },
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '4 / 5',
                    overflow: 'hidden',
                    backgroundColor: '#eceff1',
                }}
            >
                <Box
                    className="portrait"
                    component="img"
                    src={imageUrl}
                    alt={name}
                    loading="lazy"
                    decoding="async"
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform .5s cubic-bezier(.22,1,.36,1)',
                    }}
                />
                {/* Goldene Kante als wiederkehrendes Motiv. */}
                <Box
                    aria-hidden="true"
                    sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: '4px',
                        backgroundColor: 'secondary.main',
                    }}
                />
            </Box>

            <CardContent sx={{ p: { xs: 1.5, md: 2 }, flexGrow: 1 }}>
                <Typography
                    variant="h6"
                    component="h3"
                    sx={{ fontSize: { xs: '0.98rem', md: '1.12rem' }, lineHeight: 1.25 }}
                >
                    {name}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{ color: 'primary.main', fontWeight: 600, mt: 0.25 }}
                >
                    {rank}
                </Typography>
                {/* Die Funktion war vorher nur beim Hover sichtbar und damit
                    auf Touchgeraeten und per Tastatur gar nicht erreichbar. */}
                {userFunction && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {userFunction}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default ProfileCard;
