import React, {useState} from 'react';
import HeaderWithBackground from "../../components/header/HeaderWithBackground";
import {Button, Grid, Tooltip, Typography} from "@mui/material";
import ImageWithText from "../../components/image/ImageWithText";
import ImageWithTextBox from "../../components/image/ImageWithTextBox";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Box from "@mui/material/Box";
import {mockTaetigkeiten} from "../../mockdata/mockdata";
import TaetigkeitenTable from "../../components/tables/TaetigkeitenTable";

const Taetigkeiten = () => {

    const [showMore, setShowMore] = useState<boolean>(false);

    return (
        <>
            <HeaderWithBackground headerText={"Tätigkeiten"} headerSize={"h1"} imageName={"sam_3937.jpg"} polygon={"polygon(30% 0%, 124% 33%, 114% 62%, 68% 99%, -3% 83%, -8% 15%)"} heightInRem={20}/>

            <Grid
                container
                spacing={5}
                sx={{
                    justifyContent: 'center',
                    width: '100%',
                    paddingBottom: "2rem",
                    paddingTop: "2rem",
                    marginTop: {xs: "5rem", md: "10rem"},
                    backgroundColor: "white",
                }}
            >
                <Grid item xs={false} sm={1.4} md={1.4}></Grid>

                {mockTaetigkeiten.slice(0, 2).map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index + 3}>
                        <ImageWithTextBox
                            text={item.alarmtitelStichwort}
                            title={item.alarmstichwort}
                            imageUrl={item.photos[0]}
                            link={""}
                            boxInfo={item.title}
                            date={item.date}
                            id={item.id}
                        />
                    </Grid>
                ))}
                <Grid item xs={false} sm={1.4} md={1.4}></Grid>
            </Grid>


            <Grid
                container
                spacing={5}
                sx={{
                    justifyContent: 'center',
                    width: '100%',
                    paddingBottom: "2rem",
                    paddingTop: "2rem",
                    // marginBottom: { xs: "5rem", md: "10rem" },
                    backgroundColor: "white",
                }}
            >
                <Grid item xs={false} sm={1.4} md={1.4}></Grid>
                {mockTaetigkeiten.slice(2, 4).map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index + 3}>
                        <ImageWithTextBox
                            text={item.alarmtitelStichwort}
                            title={item.alarmstichwort}
                            imageUrl={item.photos[0]}
                            link={""}
                            boxInfo={item.title}
                            date={item.date}
                            id={item.id}
                        />
                    </Grid>
                ))}
                <Grid item xs={false} sm={1.4} md={1.4}></Grid>
            </Grid>

            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{height: '10vh'}} // Zentriert den Button vertikal und horizontal
            >
                <Tooltip title={showMore ? "Weniger anzeigen" : "Mehr anzeigen"} arrow>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{
                            width: '5rem',
                            height: '5rem',
                            borderRadius: '50%', // Macht den Button rund
                            fontSize: '4rem',
                            display: 'flex',
                            flexDirection: "inherit",
                            justifyContent: 'center',
                            alignItems: 'center', // Zentriert das Icon im Button
                            textAlign: "center",
                        }}
                        onClick={() => setShowMore(!showMore)}
                    >{showMore ? <ArrowUpwardIcon sx={{fontSize: "3rem"}}/> :
                        <ArrowDownwardIcon sx={{fontSize: "3rem"}}/>}</Button>
                </Tooltip>
            </Box>

            {
                showMore && (
                    <TaetigkeitenTable taetigkeiten={mockTaetigkeiten.slice(4)}/>
                )
            }
        </>
    )
        ;
};

export default Taetigkeiten;