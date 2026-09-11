import React from 'react';
import { Box, Card, CardContent, Container, Divider, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ParallaxSection from "../../components/header/ParallaxSection";
import Reveal from "../../components/motion/Reveal";

/**
 * Rechtliche Angaben.
 *
 * Die Erreichbarkeit (Telefonnummern, Anfahrt, Notruf) steht auf der
 * eigenen Kontaktseite; hier bleibt nur, was das Mediengesetz und die
 * Datenschutzerklärung verlangen.
 *
 * TODO(Feuerwehr): Die Mannschaftsseite nennt HBI Thomas Molidor als
 * Kommandanten, hier steht HBI Daniel Rothdeutsch. Eine der beiden Angaben
 * ist veraltet - bitte prüfen und beide Stellen angleichen.
 */
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Box component="section" sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom color="primary.dark">
            {title}
        </Typography>
        {children}
    </Box>
);

const Impressum: React.FC = () => {
    return (
        <>
            <ParallaxSection
                image="FFHausSeitlich.jpg"
                eyebrow="Rechtliches"
                headerText="Impressum"
                headerSize="h1"
                heightInRem={22}
                polygon="polygon(0 0, 100% 0, 100% 90%, 0 100%)"
            />

            <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
                <Reveal>
                    <Card sx={{ border: "1px solid", borderColor: "divider" }}>
                        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                            <Section title="Nach § 25 Mediengesetz">
                                <Typography variant="body1" paragraph>
                                    <strong>Medieninhaber und Herausgeber:</strong>
                                    <br />
                                    Freiwillige Feuerwehr Hausmannstätten
                                    <br />
                                    Dorfstraße 15
                                    <br />
                                    8071 Hausmannstätten, Österreich
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    <strong>Vertreten durch:</strong>
                                    <br />
                                    HBI Thomas Molidor, Feuerwehrkommandant
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    <strong>Blattlinie:</strong> Information der Bevölkerung über die
                                    Tätigkeit, die Einsätze und das Vereinsleben der Freiwilligen
                                    Feuerwehr Hausmannstätten.
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Telefonische Erreichbarkeit und Anfahrt finden Sie auf der{" "}
                                    <Link component={RouterLink} to="/kontakt">
                                        Kontaktseite
                                    </Link>
                                    .
                                </Typography>
                            </Section>

                            <Divider sx={{ my: 3 }} />

                            <Section title="Urheberrecht">
                                <Typography variant="body1" paragraph>
                                    Alle Beiträge und Bildwerke auf dieser Website wurden selbst
                                    erstellt. Die Rechte daran liegen bei der Freiwilligen Feuerwehr
                                    Hausmannstätten. Eine Weiterverwendung ist nur mit vorheriger
                                    Zustimmung zulässig.
                                </Typography>
                            </Section>

                            <Divider sx={{ my: 3 }} />

                            <Section title="Datenschutzerklärung">
                                <Typography variant="body1" paragraph>
                                    <strong>Verantwortlicher</strong> im Sinne der DSGVO ist die
                                    Freiwillige Feuerwehr Hausmannstätten, Dorfstraße 15, 8071
                                    Hausmannstätten.
                                </Typography>

                                <Typography variant="body1" paragraph>
                                    <strong>Lokale Speicherung im Browser:</strong> Diese Website
                                    setzt keine Cookies. Im lokalen Speicher (localStorage) Ihres
                                    Browsers werden ausschließlich Anzeigeeinstellungen abgelegt -
                                    etwa, ob Sie den Datenschutzhinweis oder eine Ankündigung bereits
                                    geschlossen haben. Diese Angaben verlassen Ihr Gerät nicht und
                                    können jederzeit über die Einstellungen Ihres Browsers gelöscht
                                    werden.
                                </Typography>

                                <Typography variant="body1" paragraph>
                                    <strong>Eingebettete Karte:</strong> Auf der Kontaktseite kann
                                    eine Karte von Google Maps eingebettet werden. Sie wird erst
                                    geladen, nachdem Sie dem Hinweis zugestimmt haben. Dabei wird
                                    Ihre IP-Adresse an Google übertragen. Ohne Zustimmung wird
                                    stattdessen nur die Adresse als Text angezeigt.
                                </Typography>

                                <Typography variant="body1" paragraph>
                                    <strong>Keine Weitergabe:</strong> Es werden keine
                                    personenbezogenen Daten erhoben, gespeichert oder an Dritte
                                    weitergegeben. Es findet keine Analyse des Nutzungsverhaltens
                                    statt.
                                </Typography>

                                <Typography variant="body1" paragraph>
                                    <strong>Ihre Rechte:</strong> Sie haben das Recht auf Auskunft,
                                    Berichtigung, Löschung, Einschränkung der Verarbeitung,
                                    Datenübertragbarkeit und Widerspruch. Wenden Sie sich dafür an
                                    die oben genannte Adresse. Außerdem steht Ihnen ein
                                    Beschwerderecht bei der österreichischen Datenschutzbehörde zu.
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    Diese Datenschutzerklärung kann angepasst werden, wenn sich die
                                    Website oder die rechtlichen Vorgaben ändern.
                                </Typography>
                            </Section>
                        </CardContent>
                    </Card>
                </Reveal>
            </Container>
        </>
    );
};

export default Impressum;
