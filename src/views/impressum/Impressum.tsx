import React from 'react';
import { Container, Paper, Typography, Link, Divider, useTheme } from '@mui/material';
import Map from "../../components/Map/Map"

const Impressum: React.FC = () => {
    const theme = useTheme();
    const color = "#000000"; // Black color for body text

    return (
        <Container maxWidth="lg" sx={{ padding: '2rem', color: `${theme.palette.primary.dark}` }}>
            <Paper sx={{ padding: '2rem', backgroundColor: '#f5f5f5' }}>
                <Typography variant="h4" gutterBottom sx={{ color: `${theme.palette.primary.dark}` }}>
                    Impressum
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ color: `${theme.palette.primary.dark}` }}>
                    Nach § 25 Mediengesetz:
                </Typography>

                <Typography variant="body1" paragraph sx={{ color: color }}>
                    <strong>Herausgeber:</strong><br />
                    Freiwillige Feuerwehr Hausmannstätten<br />
                    Dorfstraße 15<br />
                    8071 Hausmannstätten
                </Typography>

                <Typography variant="body1" paragraph sx={{ color: color }}>
                    <strong>Feuerwehrkommandant:</strong><br />
                    HBI Daniel Rothdeutsch<br />
                    Mobil: <Link href="tel:+436645403041" sx={{ color: `${theme.palette.primary.dark}` }}>+43 664 5403041</Link>
                </Typography>

                <Typography variant="body1" paragraph sx={{ color: color }}>
                    <strong>EDV-Beauftragter:</strong><br />
                    HBI a.D. Robert Molidor<br />
                    Mobil: <Link href="tel:+436602124170" sx={{ color: `${theme.palette.primary.dark}` }}>+43 660 2124170</Link>
                </Typography>

                <Divider sx={{ margin: '1rem 0' }} />

                <Typography variant="h6" gutterBottom sx={{ color: `${theme.palette.primary.dark}` }}>
                    Copyright
                </Typography>

                <Typography variant="body1" paragraph sx={{ color: color }}>
                    Für alle Beiträge bei der Freiwilligen Feuerwehr Hausmannstätten. Für einzelne Beiträge und Bildwerke liegen die Rechte bei der Feuerwehr Hausmannstätten. Alle Beiträge sind selbst erstellt worden.
                </Typography>

                <Divider sx={{ margin: '1rem 0' }} />

                <Typography variant="h6" gutterBottom sx={{ color: `${theme.palette.primary.dark}` }}>
                    Standort der Feuerwehr Hausmannstätten
                </Typography>

                <Typography variant="body1" paragraph sx={{ color: color }}>
                    Feuerwehr Hausmannstätten<br />
                    Dorfstraße 15<br />
                    8071 Hausmannstätten<br />
                    Österreich
                </Typography>

                {/*<Map/>*/}

                <Typography variant="body1" paragraph sx={{ color: color }}>
                    Alle Bilder wurden selbst erstellt. Somit liegt das Bildrecht bei der FF Hausmannstätten.
                </Typography>

                <Divider sx={{ margin: '1rem 0' }} />

                <Typography variant="h6" gutterBottom sx={{ color: `${theme.palette.primary.dark}` }}>
                    Datenschutzerklärung
                </Typography>

                <Typography variant="body1" paragraph sx={{ color: color }}>
                    Um Informationen zu den personenbezogenen Daten, dem Zweck und den Parteien, welchen diese Daten mitgeteilt werden, zu erhalten, kontaktieren Sie den Eigentümer.
                </Typography>

                <Typography variant="body1" paragraph sx={{ color: color }}>
                    <strong>Anbieter und Verantwortlicher</strong><br />
                    Arten der erhobenen Daten:<br />
                    Der Eigentümer stellt keine Auflistung der erhobenen personenbezogenen Daten zur Verfügung.
                </Typography>

                <Typography variant="body1" paragraph sx={{ color: color }}>
                    Vollständige Details zu jeder Art von verarbeiteten personenbezogenen Daten werden in den dafür vorgesehenen Abschnitten dieser Datenschutzerklärung oder punktuell durch Erklärungstexte bereitgestellt, die vor der Datenerhebung angezeigt werden.
                </Typography>

                <Typography variant="body1" paragraph sx={{ color: color }}>
                    Personenbezogene Daten können vom Nutzer freiwillig angegeben oder, im Falle von Nutzungsdaten, automatisch erhoben werden, wenn diese Anwendung genutzt wird.
                </Typography>

                <Typography variant="body1" paragraph sx={{ color: color }}>
                    Sofern nicht anders angegeben, ist die Angabe aller durch diese Anwendung angeforderten Daten obligatorisch. Weigert sich der Nutzer, die Daten anzugeben, kann dies dazu führen, dass diese Anwendung dem Nutzer ihre Dienste nicht zur Verfügung stellen kann.
                </Typography>

                <Divider sx={{ margin: '1rem 0' }} />

                <Typography variant="body1" paragraph sx={{ color: color }}>
                    <strong>Die Rechte der Nutzer:</strong><br />
                    Die Nutzer können bestimmte Rechte in Bezug auf ihre vom Anbieter verarbeiteten Daten ausüben.
                </Typography>

                <Typography variant="body1" paragraph sx={{ color: color }}>
                    Nutzer haben insbesondere das Recht, Folgendes zu tun:<br />
                    - Die Einwilligungen jederzeit widerrufen.<br />
                    - Widerspruch gegen die Verarbeitung ihrer Daten einlegen.<br />
                    - Auskunft bezüglich ihrer Daten erhalten.<br />
                    - Überprüfen und berichtigen lassen.<br />
                    - Einschränkung der Verarbeitung ihrer Daten verlangen.<br />
                    - Löschung oder anderweitiges Entfernen der personenbezogenen Daten verlangen.<br />
                    - Ihre Daten erhalten und an einen anderen Verantwortlichen übertragen lassen.<br />
                    - Beschwerde einreichen.
                </Typography>

                <Typography variant="body1" paragraph sx={{ color: color }}>
                    Details zum Widerspruchsrecht bezüglich der Verarbeitung:<br />
                    Werden personenbezogene Daten im öffentlichen Interesse oder zur Wahrung der berechtigten Interessen des Anbieters verarbeitet, kann der Nutzer dieser Verarbeitung widersprechen, indem er einen Rechtfertigungsgrund angibt, der sich auf seine besondere Situation bezieht.
                </Typography>

                <Divider sx={{ margin: '1rem 0' }} />

                <Typography variant="body1" paragraph sx={{ color: color }}>
                    Nutzer können weitere Informationen über die Erhebung oder Verarbeitung personenbezogener Daten jederzeit vom Anbieter über die aufgeführten Kontaktangaben anfordern.
                </Typography>

                <Typography variant="body1" paragraph sx={{ color: color }}>
                    <strong>Änderungen dieser Datenschutzerklärung:</strong><br />
                    Der Anbieter behält sich vor, jederzeit Änderungen an dieser Datenschutzerklärung vorzunehmen.
                </Typography>
            </Paper>
        </Container>
    );
};

export default Impressum;
