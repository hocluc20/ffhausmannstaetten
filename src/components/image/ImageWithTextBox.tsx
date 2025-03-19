import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Box, Typography, Card, CardMedia, Button, Grid, useTheme, Chip} from '@mui/material';
import ImageWithText from "./ImageWithText";

interface ImageWithTextProps {
    imageUrl: string;
    id: string;
    title: string;
    text: string;
    link: string;
    boxInfo: string;
    date: string;
}
const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const ImageWithTextBox: React.FC<ImageWithTextProps> = ({
                                                            imageUrl,
                                                            title,
                                                            text,
                                                            id,
                                                            link,
                                                            boxInfo,
                                                            date,
                                                        }) => {
    const navigate = useNavigate();

    const handleReadMore = () => {
        navigate(link);
    };
    const theme = useTheme();

    return (
        <Grid container spacing={2} alignItems="flex-start" columns={2}>
            {/* Erstes Bild */}
            <Grid item xs={1}>
                <ImageWithText imageUrl={imageUrl} title={""} text={""} link={link} id={id}/>
            </Grid>

            <Grid item xs={1}>
                <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor:"#b32b2b", color:"ffffff", height: 250,
                    boxShadow: "-webkit-box-shadow: 5px 5px 14px 3px rgba(0,0,0,0.4);-moz-box-shadow: 5px 5px 14px 3px rgba(0,0,0,0.4);box-shadow: 5px 5px 14px 3px rgba(0,0,0,0.4)",
                }}>
                    <Chip label={text} color="warning" sx={{ mb: 1, height:"2rem" }} />
                    <Typography fontSize={"2rem"}>
                        {title}
                    </Typography>
                    <Typography variant="body1">
                        {truncateText(boxInfo, 100)}
                    </Typography>
                    <Typography variant="body1">
                        {date}
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "#ffffff",
                            color: "#b32b2b",
                            mt: 2,
                            "&:hover": {
                                backgroundColor: "#ffd700", // Theme-Farbe direkt nutzen
                                color: "#ffffff",
                            }
                        }}
                        component={Link}
                        to={`/taetigkeit/${id}`} // Verwende die ID der Tätigkeit für den Link
                    >
                        Mehr lesen
                    </Button>
                </Card>
            </Grid>
        </Grid>
    );
};
export default ImageWithTextBox;
