import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Box, useTheme, CardMedia,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const WelcomePopup: React.FC = () => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        const isPopupClosed = localStorage.getItem("popupClosed");
        if (!isPopupClosed) {
            setOpen(true);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem("popupClosed", "true");
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
                    width: "50%",
                },
            }}
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
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
                <CardMedia
                    component="img"
                    image={"/images/Friedenslicht.png"}
                    sx={{
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                    }}
                    className="image"
                />
            </DialogContent>
        </Dialog>
    );
};

export default WelcomePopup;
