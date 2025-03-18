import React from 'react';
import HeaderWithBackground from "../../components/header/HeaderWithBackground";
import {Grid} from "@mui/material";
import ImageWithText from "../../components/image/ImageWithText";

const Taetigkeiten = () => {
    interface MockDataItem {
        text: string;
        title: string;
        imageUrl: string;
        link: string;
    }
    // Mock data for the grids
    const mockDataPrimary: MockDataItem[] = [
        {
            text: "Verkehrsunfall",
            title: "T03V",
            imageUrl: "/images/FFHausMitAutos.jpg",
            link: "impressum",
        },
        {
            text: "Brandbekämpfung",
            title: "B02",
            imageUrl: "/images/FFHausMitAutos.jpg",
            link: "services",
        },
        {
            text: "Technische Hilfe",
            title: "T01",
            imageUrl: "/images/FFHausMitAutos.jpg",
            link: "contact",
        },
        {
            text: "Hochwasser",
            title: "H01",
            imageUrl: "/images/FFHausMitAutos.jpg",
            link: "flood-info",
        },
        {
            text: "Tierrettung",
            title: "T02",
            imageUrl: "/images/FFHausMitAutos.jpg",
            link: "animal-rescue",
        },
        {
            text: "Gefahrgutunfall",
            title: "G01",
            imageUrl: "/images/FFHausMitAutos.jpg",
            link: "hazmat-info",
        }
    ];

    return (
        <>
            <HeaderWithBackground headerText={"Tätigkeiten"} headerSize={"h1"} imageName={"sam_3937.jpg"}/>

            <Grid
                container
                spacing={5}
                sx={{
                    justifyContent: 'center',
                    width: '100%',
                    paddingBottom: "2rem",
                    paddingTop: "2rem",
                    marginTop: { xs: "5rem", md: "10rem" },
                    backgroundColor: "white",
                }}
            >
                <Grid item xs={false} sm={1.4} md={1.4}></Grid>

                {mockDataPrimary.slice(0, 3).map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index + 3}>
                        <ImageWithText
                            text={item.text}
                            title={item.title}
                            imageUrl={item.imageUrl}
                            link={item.link}
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
                    marginBottom: { xs: "5rem", md: "10rem" },
                    backgroundColor: "white",
                }}
            >
                <Grid item xs={false} sm={1.4} md={1.4}></Grid>
                {mockDataPrimary.slice(3, 6).map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index + 3}>
                        <ImageWithText
                            text={item.text}
                            title={item.title}
                            imageUrl={item.imageUrl}
                            link={item.link}
                        />
                    </Grid>
                ))}
                <Grid item xs={false} sm={1.4} md={1.4}></Grid>
            </Grid>
        </>
    );
};

export default Taetigkeiten;