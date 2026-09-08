import React from "react";
import {Box, Button, Container, Typography} from "@mui/material";
import {Link} from "react-router-dom";

const NotFound: React.FC = () => (
    <Container maxWidth="sm" sx={{py: 12, textAlign: "center"}}>
        <Typography variant="h2" component="h1" color="primary.dark" fontWeight={700}>
            404
        </Typography>
        <Typography variant="h5" component="p" sx={{mt: 1, mb: 2}}>
            Diese Seite gibt es nicht.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{mb: 4}}>
            Der Link ist möglicherweise veraltet oder enthält einen Tippfehler.
        </Typography>
        <Box sx={{display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap"}}>
            <Button variant="contained" component={Link} to="/">
                Zur Startseite
            </Button>
            <Button variant="outlined" component={Link} to="/einsaetzeUndTaetigkeiten">
                Zu den Tätigkeiten
            </Button>
        </Box>
    </Container>
);

export default NotFound;
