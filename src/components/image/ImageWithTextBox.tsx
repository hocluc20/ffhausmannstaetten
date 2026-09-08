import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Card, Button, Chip } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ImageWithText from "./ImageWithText";
import KindBadge from "../operations/KindBadge";
import { OperationKind } from "../../common/models/ICategory";

interface ImageWithTextProps {
    imageUrl?: string;
    id: string;
    title: string;
    text: string;
    link?: string;
    boxInfo: string;
    date: string;
    /** Einsatz oder Tätigkeit. */
    kind?: OperationKind;
}

const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? `${text.substring(0, maxLength).trimEnd()}...` : text;

/**
 * Bild links, roter Textblock rechts. Ab `sm` nebeneinander, darunter
 * gestapelt - vorher waren es fix zwei Spalten, die auf dem Handy
 * zusammengequetscht wurden.
 */
const ImageWithTextBox: React.FC<ImageWithTextProps> = ({
    imageUrl,
    title,
    text,
    id,
    boxInfo,
    date,
    kind,
}) => {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                alignItems: 'stretch',
            }}
        >
            <ImageWithText
                imageUrl={imageUrl}
                title={""}
                text={""}
                id={id}
                kind={kind}
                height={{ xs: 200, sm: 260, md: 280 }}
            />

            <Card
                sx={{
                    p: { xs: 2, md: 2.5 },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    minHeight: { xs: 'auto', sm: 260, md: 280 },
                    background:
                        kind === "taetigkeit"
                            ? 'linear-gradient(145deg, #3a322c 0%, #241f1b 100%)'
                            : 'linear-gradient(145deg, #b32b2b 0%, #8d1f1f 100%)',
                    color: "#ffffff",
                    boxShadow: '0 10px 30px rgba(26,22,20,.18)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Dezentes Wappenmotiv im Hintergrund. */}
                <Box
                    aria-hidden="true"
                    sx={{
                        position: 'absolute',
                        right: -40,
                        top: -40,
                        width: 180,
                        height: 180,
                        borderRadius: '50%',
                        border: '10px solid rgba(255,255,255,.07)',
                    }}
                />

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    {kind && <KindBadge kind={kind} />}
                    {text && (
                        <Chip
                            label={text}
                            size="small"
                            sx={{ backgroundColor: 'rgba(255,255,255,.16)', color: '#ffffff' }}
                        />
                    )}
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,.85)' }}>
                        {date}
                    </Typography>
                </Box>

                <Typography
                    variant="h5"
                    component="h3"
                    sx={{ color: '#ffffff', lineHeight: 1.18, textWrap: 'balance' }}
                >
                    {truncateText(title, 70)}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{ color: 'rgba(255,255,255,.9)', flexGrow: 1 }}
                >
                    {truncateText(boxInfo, 120)}
                </Typography>

                <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    component={Link}
                    to={`/taetigkeit/${id}`}
                    sx={{
                        alignSelf: 'flex-start',
                        mt: 1,
                        backgroundColor: "#ffffff",
                        color: kind === "taetigkeit" ? "text.primary" : "primary.main",
                        "&:hover": { backgroundColor: "secondary.main", color: "text.primary" },
                    }}
                >
                    Mehr lesen
                </Button>
            </Card>
        </Box>
    );
};

export default ImageWithTextBox;
