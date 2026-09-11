import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    Link,
    Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import PlaceIcon from "@mui/icons-material/Place";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Link as RouterLink } from "react-router-dom";
import ParallaxSection from "../../components/header/ParallaxSection";
import SectionHeading from "../../components/layout/SectionHeading";
import { Stagger, StaggerItem } from "../../components/motion/Reveal";
import Map from "../../components/Map/Map";

const ADDRESS = "Dorfstraße 15, 8071 Hausmannstätten";
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${ADDRESS}, Österreich`
)}`;

/**
 * TODO(Feuerwehr): Die Namen der Ansprechpersonen bitte gegen den aktuellen
 * Stand prüfen - Impressum und Mannschaftsseite nennen unterschiedliche
 * Kommandanten.
 */
const CONTACTS = [
    {
        role: "Feuerwehrkommandant",
        name: "HBI Thomas Molidor",
        phone: "+43 664 75058043",
        tel: "+4366475058043",
    },
    {
        role: "EDV-Beauftragter",
        name: "LM d.V. Lukas Hochfellner",
        phone: "+43 664 1822812",
        tel: "+436641822812",
    },
];

const Kontakt: React.FC = () => {
    const [mapAllowed, setMapAllowed] = useState(false);

    // Die Karte lädt Ressourcen von Google. Sie erscheint erst, wenn dem
    // Hinweis zugestimmt wurde - sonst würde ungefragt eine Verbindung zu
    // einem Dritten aufgebaut.
    useEffect(() => {
        try {
            setMapAllowed(localStorage.getItem("ffh:storage-consent") === "accepted");
        } catch {
            setMapAllowed(false);
        }
    }, []);

    return (
        <>
            <ParallaxSection
                image="FFHausVorne.jpg"
                eyebrow="Wir sind für Sie da"
                headerText="Kontakt"
                headerSize="h1"
                heightInRem={26}
                polygon="polygon(0 0, 100% 0, 100% 90%, 0 100%)"
            />

            <Container maxWidth="lg" sx={{ py: { xs: 5, md: 9 } }}>
                {/* Notruf zuerst - das ist die wichtigste Information auf dieser Seite. */}
                <Card
                    sx={{
                        mb: { xs: 4, md: 6 },
                        border: "2px solid",
                        borderColor: "primary.main",
                        backgroundColor: "#fff6f6",
                    }}
                >
                    <CardContent
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: { xs: "flex-start", sm: "center" },
                            gap: 2,
                            p: { xs: 2.5, md: 3 },
                        }}
                    >
                        <WarningAmberIcon sx={{ fontSize: "3rem", color: "primary.main" }} />
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" component="h2" color="primary.dark">
                                Im Notfall: 122
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Feuerwehr-Notruf, rund um die Uhr besetzt. 
                            </Typography>
                        </Box>
                        
                    </CardContent>
                </Card>

                <SectionHeading
                    eyebrow="Erreichbarkeit"
                    title="So erreichen Sie uns"
                    subtitle="Für Fragen jeglicher Art stehen wir Ihnen gerne zur Verfügung."
                />

                <Stagger>
                    <Grid container spacing={{ xs: 2.5, md: 3 }}>
                        <Grid item xs={12} md={6}>
                            <StaggerItem style={{ height: "100%" }}>
                                <Card sx={{ height: "100%", border: "1px solid", borderColor: "divider" }}>
                                    <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                                        <Typography variant="overline" color="primary.main">
                                            Rüsthaus
                                        </Typography>
                                        <Typography variant="h5" component="h3" gutterBottom>
                                            Freiwillige Feuerwehr Hausmannstätten
                                        </Typography>

                                        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", mt: 2 }}>
                                            <PlaceIcon sx={{ color: "primary.main" }} />
                                            <Typography variant="body1">
                                                Dorfstraße 15
                                                <br />
                                                8071 Hausmannstätten
                                                <br />
                                                Österreich
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mt: 2 }}>
                                            <EmailIcon sx={{ color: "primary.main" }} />
                                            <Link href="mailto:ff.hausmannstaetten@bfvgu.at" underline="hover">
                                                ff.hausmannstaetten@bfvgu.at
                                            </Link>
                                        </Box>

                                        <Button
                                            variant="outlined"
                                            endIcon={<OpenInNewIcon />}
                                            href={MAPS_LINK}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{ mt: 3 }}
                                        >
                                            Route planen
                                        </Button>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <StaggerItem style={{ height: "100%" }}>
                                <Card sx={{ height: "100%", border: "1px solid", borderColor: "divider" }}>
                                    <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                                        <Typography variant="overline" color="primary.main">
                                            Ansprechpersonen
                                        </Typography>
                                        <Typography variant="h5" component="h3" gutterBottom>
                                            Direkter Draht
                                        </Typography>

                                        <Box sx={{ display: "grid", gap: 2, mt: 2 }}>
                                            {CONTACTS.map((person) => (
                                                <Box
                                                    key={person.tel}
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        gap: 2,
                                                        flexWrap: "wrap",
                                                        pb: 1.5,
                                                        borderBottom: "1px solid",
                                                        borderColor: "divider",
                                                        "&:last-of-type": { borderBottom: 0, pb: 0 },
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {person.role}
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight={600}>
                                                            {person.name}
                                                        </Typography>
                                                    </Box>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<PhoneIcon />}
                                                        href={`tel:${person.tel}`}
                                                    >
                                                        {person.phone}
                                                    </Button>
                                                </Box>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        </Grid>
                    </Grid>
                </Stagger>

                <Box sx={{ mt: { xs: 5, md: 8 } }}>
                    <SectionHeading eyebrow="Anfahrt" title="Wo Sie uns finden" />

                    {mapAllowed ? (
                        <Map />
                    ) : (
                        <Card sx={{ border: "1px dashed", borderColor: "divider", textAlign: "center" }}>
                            <CardContent sx={{ py: 5 }}>
                                <PlaceIcon sx={{ fontSize: "3rem", color: "primary.main", mb: 1 }} />
                                <Typography variant="body1" gutterBottom>
                                    {ADDRESS}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: "48ch", mx: "auto" }}>
                                    Die eingebettete Karte lädt Daten von Google. Sie wird erst
                                    angezeigt, wenn Sie dem Hinweis am Seitenende zugestimmt haben.
                                </Typography>
                                <Button
                                    variant="contained"
                                    endIcon={<OpenInNewIcon />}
                                    href={MAPS_LINK}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ mt: 3 }}
                                >
                                    In Google Maps öffnen
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </Box>

                <Box sx={{ mt: 5, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                        Rechtliche Angaben nach § 25 Mediengesetz finden Sie im{" "}
                        <Link component={RouterLink} to="/impressum">
                            Impressum
                        </Link>
                        .
                    </Typography>
                </Box>
            </Container>
        </>
    );
};

export default Kontakt;
