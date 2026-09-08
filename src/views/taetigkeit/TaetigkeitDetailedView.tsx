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
    DialogContent,
    DialogTitle,
    IconButton,
} from '@mui/material';
import React, { useState } from 'react';
import { useParams } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useAPI } from "../../common/context/DataContext";
import HeaderWithBackgroundUrl from "../../components/header/HeaderWithBackgroundFromUrl";
import { CardSkeletons, LoadError } from "../../components/feedback/DataState";
import NotFound from "../notfound/NotFound";
import { Container } from "@mui/material";
import Reveal from "../../components/motion/Reveal";
import KindBadge from "../../components/operations/KindBadge";

const dateFormatter = new Intl.DateTimeFormat('de-AT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
});

const TaetigkeitDetailedView = () => {
    const { operations, isLoading, error, reload } = useAPI();
    const { id } = useParams<{ id: string }>();

    const [open, setOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string>("");

    const handleClickOpen = (image: string) => {
        setSelectedImage(image);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    // Vorher wurde bei fehlendem Eintrag ein leeres Fragment gerendert -
    // Laden, Fehler und "gibt es nicht" sahen alle gleich aus.
    if (isLoading) {
        return (
            <Box sx={{ px: 2, py: 6 }}>
                <CardSkeletons count={1} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ py: 6 }}>
                <LoadError message={error} onRetry={reload} />
            </Box>
        );
    }

    const parsedId = Number(id);
    const taetigkeit = Number.isFinite(parsedId)
        ? operations.find((operation) => operation.id === parsedId)
        : undefined;

    if (!taetigkeit) {
        return <NotFound />;
    }

    return (
        <>
            <HeaderWithBackgroundUrl
                headerText={taetigkeit.title}
                headerSize={"h2"}
                imageName={taetigkeit.headline_image_rendered}
                heightInRem={20}
                polygon={"polygon(18% 0%, 121% 26%, 134% 1%, 73% 97%, -17% 65%, -13% 27%)"}
            />

            <Container maxWidth="md" sx={{ py: { xs: 4, md: 7 } }}>
              <Reveal>
                <Card
                    sx={{
                        // Die Karte ueberlappt den Parallax-Abschnitt leicht.
                        mt: { xs: -4, md: -8 },
                        position: 'relative',
                        zIndex: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 18px 50px rgba(26,22,20,.16)',
                    }}
                >
                <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                    <Typography variant="h4" component="h2" color="primary.main" gutterBottom>
                        {taetigkeit.title}
                    </Typography>

                    {/* Art des Eintrags gleich unter dem Titel - so ist auf
                        den ersten Blick klar, ob es ein Einsatz war. */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
                        <KindBadge kind={taetigkeit.kind} typeName={taetigkeit.type?.name_short} />
                        {taetigkeit.type?.name_long && (
                            <Typography variant="body2" color="text.secondary">
                                {taetigkeit.type.name_long}
                            </Typography>
                        )}
                    </Box>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                {/* getUTCDate() lieferte nur den Tag im Monat, z. B. "8". */}
                                <strong>Datum:</strong> {dateFormatter.format(taetigkeit.date)}
                            </Typography>
                        </Grid>
                    </Grid>

                    {taetigkeit.organisations.length > 0 && (
                        <Box mt={2}>
                            <Typography variant="body1" gutterBottom>
                                <strong>Eingesetzte Feuerwehren:</strong>
                            </Typography>
                            <Grid container spacing={1}>
                                {taetigkeit.organisations.map((feuerwehr) => (
                                    <Grid item key={feuerwehr}>
                                        <Chip label={feuerwehr} color="primary" />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {taetigkeit.vehicles.length > 0 && (
                        <Box mt={2}>
                            <Typography variant="body1" gutterBottom>
                                <strong>Eingesetzte Fahrzeuge:</strong>
                            </Typography>
                            <Grid container spacing={1}>
                                {taetigkeit.vehicles.map((auto) => (
                                    <Grid item key={auto.id}>
                                        <Chip label={auto.name_short} color="secondary" />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {taetigkeit.content && (
                        <Box mt={3}>
                            <Typography
                                variant="body1"
                                sx={{ fontSize: "1.1rem", whiteSpace: "pre-line" }}
                            >
                                {taetigkeit.content}
                            </Typography>
                        </Box>
                    )}

                    {taetigkeit.photos.length > 0 && (
                        <>
                            <Divider sx={{ my: 3 }} />
                            <Box>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Fotos der Tätigkeit:</strong>
                                </Typography>
                                <Grid container spacing={2}>
                                    {taetigkeit.photos.map((photo, index) => (
                                        <Grid item xs={12} sm={6} md={4} key={photo}>
                                            <Box
                                                component="button"
                                                type="button"
                                                onClick={() => handleClickOpen(photo)}
                                                aria-label={`Foto ${index + 1} vergrößern`}
                                                sx={{
                                                    position: 'relative',
                                                    display: 'block',
                                                    width: '100%',
                                                    p: 0,
                                                    border: 0,
                                                    background: 'none',
                                                    cursor: 'pointer',
                                                    borderRadius: 2,
                                                    // Overlay reagiert auf Hover UND Tastaturfokus.
                                                    '&:hover .zoom, &:focus-visible .zoom': { opacity: 1 },
                                                    '&:focus-visible': {
                                                        outline: '3px solid #ffd700',
                                                        outlineOffset: '2px',
                                                    },
                                                }}
                                            >
                                                <CardMedia
                                                    component="img"
                                                    image={photo}
                                                    alt={`Foto ${index + 1} der Tätigkeit ${taetigkeit.title}`}
                                                    loading="lazy"
                                                    sx={{
                                                        height: 200,
                                                        objectFit: 'cover',
                                                        borderRadius: 2,
                                                        boxShadow: 2,
                                                        backgroundColor: '#eceff1',
                                                    }}
                                                />
                                                <Box
                                                    className="zoom"
                                                    sx={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: 'rgba(255,255,255,0.45)',
                                                        borderRadius: 2,
                                                        opacity: 0,
                                                        transition: 'opacity 0.3s ease',
                                                        '@media (prefers-reduced-motion: reduce)': {
                                                            transition: 'none',
                                                        },
                                                    }}
                                                >
                                                    <SearchIcon sx={{ width: "5rem", height: "5rem", color: '#b32b2b' }} />
                                                </Box>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </>
                    )}
                </CardContent>
                </Card>
              </Reveal>
            </Container>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ pr: 6 }}>
                    Foto
                    <IconButton
                        onClick={handleClose}
                        aria-label="Schließen"
                        sx={{ position: 'absolute', right: "1rem", top: 8, zIndex: 1 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box
                        component="img"
                        src={selectedImage}
                        alt={`Foto der Tätigkeit ${taetigkeit.title}`}
                        sx={{ width: '100%', height: 'auto', borderRadius: 2, display: 'block' }}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TaetigkeitDetailedView;
