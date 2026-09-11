import React, { useMemo } from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import ProfileCard from '../../components/mitglieder/ProfileCard';
import ParallaxSection from "../../components/header/ParallaxSection";
import SectionHeading from "../../components/layout/SectionHeading";
import { Stagger, StaggerItem } from "../../components/motion/Reveal";
import { useAPI } from "../../common/context/DataContext";
import { groupMembers, resolveMembers } from "../../data/members";
import NotFound from "../notfound/NotFound";

/**
 * Bis echte Portraits hinterlegt sind, wird bewusst eine neutrale Silhouette
 * gezeigt - vorher stand bei allen 17 Personen dasselbe Foto.
 */
const PLACEHOLDER_PORTRAIT = '/images/feuerwehrMannPlatzhalterKompremiertAuf300px.png';

const Mitglieder: React.FC = () => {
    const { members, settings, isLoading } = useAPI();

    // Aus dem Adminbereich, sonst die mitgelieferte Liste.
    const groups = useMemo(() => groupMembers(resolveMembers(members)), [members]);
    const total = useMemo(
        () => groups.reduce((sum, [, entries]) => sum + entries.length, 0),
        [groups]
    );

    // Im Adminbereich abgeschaltet: die Seite verhält sich, als gäbe es sie
    // nicht. Erst nach dem Laden entscheiden, sonst blitzt die 404-Seite auf.
    if (!isLoading && !settings.membersVisible) return <NotFound />;

    return (
        <>
            <ParallaxSection
                image="sam_3937.jpg"
                eyebrow="Ehrenamtlich im Dienst"
                headerText="Unsere Mannschaft"
                headerSize="h1"
                heightInRem={26}
                polygon="polygon(0 0, 100% 0, 100% 90%, 0 100%)"
            />

            <Container maxWidth="lg" sx={{ py: { xs: 5, md: 9 } }}>
                <SectionHeading
                    eyebrow="Führung & Funktionen"
                    title="Kommando und Beauftragte"
                    subtitle={`Der gesetzliche und erweiterte Ausschuss der FF Hausmannstätten umfasst insgesamt ${total} Personen.`}
                />

                {groups.map(([group, groupMembersList]) => (
                    // Fragment ohne key hatte hier bei jedem Render eine
                    // React-Warnung erzeugt.
                    <Box component="section" key={group} sx={{ mb: { xs: 5, md: 8 } }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                            <Typography
                                variant="h4"
                                component="h2"
                                sx={{ color: "primary.dark", whiteSpace: "nowrap" }}
                            >
                                {group}
                            </Typography>
                            <Box sx={{ flex: 1, height: "2px", backgroundColor: "divider" }} />
                            <Typography variant="body2" color="text.secondary">
                                {groupMembersList.length}
                            </Typography>
                        </Box>

                        <Stagger>
                            {/* Vorher: marginLeft/-Right in vh (vertikale Einheit fuer
                                horizontalen Abstand) - das hat Querscrollen erzwungen. */}
                            <Grid container spacing={{ xs: 2, md: 3 }}>
                                {groupMembersList.map((member) => (
                                    <Grid item xs={6} sm={4} md={3} key={member.id} sx={{ display: "flex" }}>
                                        <StaggerItem style={{ width: "100%", display: "flex" }}>
                                            <ProfileCard
                                                name={member.name}
                                                rank={member.rank}
                                                function={member.function}
                                                imageUrl={member.portraitUrl || PLACEHOLDER_PORTRAIT}
                                            />
                                        </StaggerItem>
                                    </Grid>
                                ))}
                            </Grid>
                        </Stagger>
                    </Box>
                ))}
            </Container>
        </>
    );
};

export default Mitglieder;
