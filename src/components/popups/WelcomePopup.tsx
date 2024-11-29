import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    Box, useTheme, CardMedia,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const WelcomePopup: React.FC = () => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        setOpen(true);
    }, []);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                style: {
                    borderRadius: "15px",
                    padding: "10px",
                    background: "#ffffff",
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
                    height: "85%",
                    width: "50%"
                },
            }}
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    {/*<Typography*/}
                    {/*    variant="h6"*/}
                    {/*    component="span"*/}
                    {/*    sx={{ fontWeight: "bold", color: `${theme.palette.primary.main}` }}*/}
                    {/*>*/}
                    {/*    Willkommen!*/}
                    {/*</Typography>*/}
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            color: "#000000",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.4)",
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                {/*<Typography*/}
                {/*    variant="body1"*/}
                {/*    sx={{*/}
                {/*        color: "#000000",*/}
                {/*        textAlign: "center",*/}
                {/*        fontSize: "1.1rem",*/}
                {/*    }}*/}
                {/*>*/}
                {/*    Schön, dass Sie hier sind! Entdecken Sie die neuen Funktionen und*/}
                {/*    lassen Sie sich inspirieren.*/}
                {/*</Typography>*/}
                <CardMedia
                    component="img"
                    image={"/images/FFHausMitAutos.jpg"}
                    sx={{
                        height: 250,
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                    }}
                    className="image"
                />
            </DialogContent>
        </Dialog>
    );
};

export default WelcomePopup;
