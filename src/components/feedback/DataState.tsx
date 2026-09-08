import React from "react";
import {Alert, AlertTitle, Box, Button, Card, Grid, Skeleton, Typography} from "@mui/material";

/** Platzhalterkarten, solange die Einsätze geladen werden. */
export const CardSkeletons: React.FC<{ count?: number }> = ({count = 3}) => (
    <Grid container spacing={5} justifyContent="center" sx={{width: "100%"}}>
        {Array.from({length: count}).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{p: 0, overflow: "hidden"}}>
                    <Skeleton variant="rectangular" height={250} animation="wave"/>
                    <Box sx={{p: 2}}>
                        <Skeleton width="55%" height={28}/>
                        <Skeleton width="85%"/>
                    </Box>
                </Card>
            </Grid>
        ))}
    </Grid>
);

/** Fehlermeldung mit Möglichkeit zum erneuten Laden. */
export const LoadError: React.FC<{ message: string; onRetry?: () => void }> = ({
                                                                                  message,
                                                                                  onRetry,
                                                                              }) => (
    <Box sx={{display: "flex", justifyContent: "center", px: 2, width: "100%"}}>
        <Alert
            severity="warning"
            sx={{maxWidth: 620, width: "100%"}}
            action={
                onRetry && (
                    <Button color="inherit" size="small" onClick={onRetry}>
                        Erneut versuchen
                    </Button>
                )
            }
        >
            <AlertTitle>Inhalte derzeit nicht verfügbar</AlertTitle>
            {message}
        </Alert>
    </Box>
);

/** Neutraler Hinweis, wenn die Abfrage erfolgreich war, aber nichts geliefert hat. */
export const EmptyState: React.FC<{ message: string }> = ({message}) => (
    <Box sx={{textAlign: "center", py: 6, px: 2, width: "100%"}}>
        <Typography variant="body1" color="text.secondary">
            {message}
        </Typography>
    </Box>
);
