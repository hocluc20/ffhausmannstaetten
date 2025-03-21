import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Divider,
    Grid,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton
} from '@mui/material';
import React, {useState} from 'react';
import {useParams} from "react-router";
import {mockTaetigkeiten} from "../../mockdata/mockdata";
import HeaderWithBackground from "../../components/header/HeaderWithBackground";
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import {useAPI} from "../../common/context/DataContext";
import HeaderWithBackgroundUrl from "../../components/header/HeaderWithBackgroundFromUrl";

const TaetigkeitDetailedView = () => {
    const {operations} = useAPI()
    const {id} = useParams();
    const taetigkeit = operations.find((taetigkeit) => taetigkeit.id === parseInt(id));

    const [open, setOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");

    const handleClickOpen = (image) => {
        setSelectedImage(image);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            {taetigkeit ? <>
                <HeaderWithBackgroundUrl
                    headerText={taetigkeit.title}
                    headerSize={"h2"}
                    imageName={taetigkeit.headline_image_rendered}
                    heightInRem={20}
                    polygon={"polygon(18% 0%, 121% 26%, 134% 1%, 73% 97%, -17% 65%, -13% 27%)"}
                />
                <Card sx={{maxWidth: 900, margin: 'auto', mt: 4}}>
                    <CardContent>
                        <Typography variant="h4" gutterBottom>
                            {taetigkeit.title}
                        </Typography>

                        {/* Alarmtitel und Alarmstichwort */}
                        <Typography variant="h4" color="#b32b2b" gutterBottom>
                            {taetigkeit.title}
                            {taetigkeit.type && (
                                <Typography variant="body2" color="#000000">
                                    (Alarmstichwort: {taetigkeit.type.name_short})
                                </Typography>
                            )}
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body1">
                                    <strong>Datum:</strong> {taetigkeit.date.getUTCDate()}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1">
                                    {/*<strong>Zeit:</strong> {taetigkeit.startZeit} - {taetigkeit.endeZeit}*/}
                                </Typography>
                            </Grid>
                        </Grid>

                        <Box mt={2}>
                            <Typography variant="body1" gutterBottom color={"#000000"}>
                                <strong>Eingesetzte Feuerwehren:</strong>
                            </Typography>
                            <Grid container spacing={1}>
                                {taetigkeit.organisations.map((feuerwehr, index) => (
                                    <Grid item key={index}>
                                        <Chip label={feuerwehr} color="primary"/>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        <Box mt={2}>
                            <Typography variant="body1" gutterBottom color={"#000000"}>
                                <strong>Eingesetzte Fahrzeuge:</strong>
                            </Typography>
                            <Grid container spacing={1}>
                                {taetigkeit.vehicles.map((auto, index) => (
                                    <Grid item key={index}>
                                        <Chip label={auto.name_short} color="secondary"/>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        {/* Ausschreibung hinzufügen */}
                        <Box mt={2}>
                            <Typography variant="body1" gutterBottom>
                                <Typography variant="body2" color="#000000" fontSize={"1.2rem"}>
                                    {taetigkeit.content}
                                </Typography>
                            </Typography>
                        </Box>

                        <Divider sx={{my: 2}}/>

                        {taetigkeit.photos.length > 0 && (
                            <Box>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Fotos der Tätigkeit:</strong>
                                </Typography>
                                <Grid container spacing={2}>
                                    {taetigkeit.photos.map((photo, index) => (
                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                            {/*<CardMedia*/}
                                            {/*    component="img"*/}
                                            {/*    image={photo}*/}
                                            {/*    alt={`Foto ${index + 1}`}*/}
                                            {/*    sx={{*/}
                                            {/*        height: 200,*/}
                                            {/*        objectFit: 'cover',*/}
                                            {/*        borderRadius: 2,*/}
                                            {/*        boxShadow: 2,*/}
                                            {/*        cursor: 'pointer',*/}
                                            {/*    }}*/}
                                            {/*    onClick={() => handleClickOpen(photo)}*/}
                                            {/*/>*/}
                                            <Box sx={{position: 'relative', display: 'inline-block'}}>
                                                <CardMedia
                                                    component="img"
                                                    image={photo}
                                                    alt={`Foto ${index + 1}`}
                                                    sx={{
                                                        height: 200,
                                                        objectFit: 'cover',
                                                        borderRadius: 2,
                                                        boxShadow: 2,
                                                        cursor: 'pointer',
                                                        transition: 'filter 0.3s ease',  // Für den Weichzeichnungs-Effekt
                                                    }}
                                                    onClick={() => handleClickOpen(photo)}
                                                />
                                                {/* Plus-Symbol wird bei Hover eingeblendet */}
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        color: '#b32b2b',
                                                        opacity: 0,
                                                        transition: 'opacity 0.3s ease',
                                                        '&:hover': {
                                                            opacity: 1,  // Einblendung des Symbols bei Hover
                                                        },
                                                    }}
                                                    onClick={() => handleClickOpen(photo)}
                                                >
                                                    <SearchIcon
                                                        style={{
                                                            width: "10rem",  // Größe der Breite anpassen
                                                            height: "10rem", // Höhe ebenfalls anpassen
                                                            color: '#b32b2b'
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth style={{overflow: "hidden"}}>
                    <DialogTitle>
                        <IconButton
                            edge="end"
                            color="default"
                            onClick={handleClose}
                            aria-label="close"
                            sx={{
                                position: 'absolute',
                                color: "#00000",
                                right: "1rem",
                                top: 8,
                                zIndex: 1,
                                overflow: "hidden"
                            }}
                        >
                            <CloseIcon/>
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Box
                            style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: 8,
                                overflow: 'hidden', // Optional: Ensures the border-radius is applied properly
                            }}
                        >
                            <img
                                src={selectedImage}
                                alt="Selected"
                                style={{
                                    width: '97%',
                                    height: 'auto',
                                    borderRadius: 8,
                                }}
                            />
                        </Box>
                    </DialogContent>
                </Dialog>
            </> : <></>}
        </>

    );
};

export default TaetigkeitDetailedView;
