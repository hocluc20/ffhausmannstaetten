import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Import für Theme-Hook

const CookiePopup: React.FC = () => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();


    useEffect(() => {
        const cookieAccepted = localStorage.getItem('cookieAccepted');
        if (!cookieAccepted) {
            setOpen(true);
        }
    }, []);


    const handleAccept = () => {
        localStorage.setItem('cookieAccepted', 'true');
        setOpen(false);
    };

    return (
        <Dialog open={open} onClose={() => setOpen(false)} sx={{
            '& .MuiDialog-paper': {
                backgroundColor: theme.palette.background.paper,
                padding: '20px',
                borderRadius: '8px',
                boxShadow: theme.shadows[5],
            },
        }}>
            <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                Cookies akzeptieren
            </DialogTitle>
            <DialogContent
                sx={{
                    color: '#000000',
                    fontSize: theme.typography.body1.fontSize,
                    fontFamily: theme.typography.fontFamily,
                }}
            >
                <p>
                    Wir verwenden Cookies, um die Benutzererfahrung zu verbessern. Durch die Nutzung der Website stimmen Sie der Verwendung von Cookies zu.
                </p>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={handleAccept}
                    color="primary"
                    variant="contained"
                    sx={{
                        backgroundColor: theme.palette.primary.main,
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                        },
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                        padding: '10px 20px',
                    }}
                >
                    Akzeptieren
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CookiePopup;
