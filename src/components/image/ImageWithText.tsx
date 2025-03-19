import React from 'react';
import {Link, useNavigate} from 'react-router-dom'; // React Router für Navigation
import { Box, Typography, Card, CardMedia, CardContent } from '@mui/material';

interface ImageWithTextProps {
    imageUrl: string;
    title: string;
    text: string;
    link: string;
    id:string;
}

const ImageWithText: React.FC<ImageWithTextProps> = ({ imageUrl, title, text, link, id }) => {


    return (
        <Card
            sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
                boxShadow: "-webkit-box-shadow: 5px 5px 14px 3px rgba(0,0,0,0.4);-moz-box-shadow: 5px 5px 14px 3px rgba(0,0,0,0.4);box-shadow: 5px 5px 14px 3px rgba(0,0,0,0.4)",
                cursor: 'pointer',
                '&:hover .image': {
                    transform: 'scale(1.1)',
                    filter: 'brightness(0.7)',
                },
                transition: 'transform 0.5s ease, filter 0.3s ease',
            }}
            component={Link}
            to={`/taetigkeit/${id}`}
        >
            {/* Bild mit Hover-Effekt */}
            <CardMedia
                component="img"
                alt={title}
                image={imageUrl}
                sx={{
                    height: 250,
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                }}
                className="image"
            />

            {/* Textbereich */}
            <CardContent
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(0, 0, 0, 0.1)',
                    color: 'white',
                    padding: 3,
                    borderRadius: '0 0 8px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    height: '100%',
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
                    {title}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '1rem' }}>
                    {text}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default ImageWithText;
