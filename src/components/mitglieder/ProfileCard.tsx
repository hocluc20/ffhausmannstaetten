import React from 'react';
import {Card, CardContent, Typography, Box, styled, useTheme} from '@mui/material';

const HoverableImage = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: "100%",
    height: 300,
    margin: '0 auto',
    overflow: 'hidden',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
    '&:hover .hoverOverlay': {
        opacity: 1,
    },
}));

const Image = styled('img')({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
});

const HoverOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: theme.palette.action.hover,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.common.white,
    fontSize: '1.2rem',
    fontWeight: 'bold',
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out',
}));

interface ProfileCardProps {
    name: string;
    rank: string;
    function: string;
    imageUrl: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, rank, function: userFunction, imageUrl }) => {
    const theme = useTheme();
    return (
        <Card sx={{ maxWidth: 300, textAlign: 'center', borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
                <HoverableImage>
                    <Image src={imageUrl} alt={name} />
                    <HoverOverlay className="hoverOverlay" sx={{color:"#ffffff", fontFamily:"sans-serif", backgroundColor:'rgba(0, 0, 0, 0.35)'}}>{userFunction}</HoverOverlay>
                </HoverableImage>
                <Box mt={2}>
                    <Typography variant="h6" component="div" color={"#000000"}>
                        {name}
                    </Typography>
                    <Typography variant="body2" color={theme.palette.primary.main}>
                        {rank}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProfileCard;
