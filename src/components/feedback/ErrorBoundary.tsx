import React from "react";
import {Box, Button, Container, Link, Typography} from "@mui/material";

interface State {
    hasError: boolean;
}

/**
 * Fängt Render-Fehler ab, damit ein einzelner Fehler nicht die gesamte Seite
 * weiß werden lässt. Im Fallback stehen die Kontaktdaten der Feuerwehr.
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
    state: State = {hasError: false};

    static getDerivedStateFromError(): State {
        return {hasError: true};
    }

    componentDidCatch(error: Error) {
        console.error("Unerwarteter Fehler in der Anwendung:", error);
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <Container maxWidth="sm" sx={{py: 10, textAlign: "center"}}>
                <Typography variant="h4" gutterBottom color="primary.dark">
                    Da ist etwas schiefgelaufen
                </Typography>
                <Typography variant="body1" sx={{mb: 3}}>
                    Die Seite konnte nicht dargestellt werden. Bitte laden Sie die Seite neu.
                    Falls das Problem bestehen bleibt, erreichen Sie uns direkt:
                </Typography>
                <Box sx={{mb: 4}}>
                    <Typography variant="body1">
                        Freiwillige Feuerwehr Hausmannstätten<br/>
                        Dorfstraße 15, 8071 Hausmannstätten<br/>
                        <Link href="mailto:kdo.020@bfvgu.steiermark.at">
                            kdo.020@bfvgu.steiermark.at
                        </Link>
                    </Typography>
                </Box>
                <Button variant="contained" onClick={() => window.location.reload()}>
                    Seite neu laden
                </Button>
            </Container>
        );
    }
}

export default ErrorBoundary;
