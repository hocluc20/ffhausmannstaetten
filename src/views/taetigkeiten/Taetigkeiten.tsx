import React, { useMemo, useState } from 'react';
import { Box, Button, Container, Grid } from "@mui/material";
import ImageWithTextBox from "../../components/image/ImageWithTextBox";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TaetigkeitenTable from "../../components/tables/TaetigkeitenTable";
import { useAPI } from "../../common/context/DataContext";
import { CardSkeletons, EmptyState, LoadError } from "../../components/feedback/DataState";
import ParallaxSection from "../../components/header/ParallaxSection";
import SectionHeading from "../../components/layout/SectionHeading";
import { Stagger, StaggerItem } from "../../components/motion/Reveal";
import Presence from "../../components/motion/Presence";
import { motion, useReducedMotion } from "motion/react";
import OperationFilter, {
    EMPTY_FILTER,
    OperationFilterValue,
} from "../../components/operations/OperationFilter";

/** Wie viele Einträge als Karten oben stehen, bevor die Tabelle beginnt. */
const FEATURED_COUNT = 4;

const dateFormatter = new Intl.DateTimeFormat('de-AT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
});

const Taetigkeiten: React.FC = () => {
    const [showMore, setShowMore] = useState(false);
    const [filter, setFilter] = useState<OperationFilterValue>(EMPTY_FILTER);
    const { operations, types, isLoading, error, reload } = useAPI();
    const reduced = useReducedMotion();

    const visible = useMemo(() => {
        const needle = filter.search.trim().toLowerCase();

        return operations.filter((operation) => {
            if (filter.kind !== "alle" && operation.kind !== filter.kind) return false;
            if (filter.typeId !== "alle" && operation.type?.id !== filter.typeId) return false;
            if (!needle) return true;

            return [
                operation.title,
                operation.headline,
                operation.content,
                operation.type?.name_short ?? "",
                dateFormatter.format(operation.date),
            ]
                .join(" ")
                .toLowerCase()
                .includes(needle);
        });
    }, [operations, filter]);

    const featured = visible.slice(0, FEATURED_COUNT);
    const remaining = visible.slice(FEATURED_COUNT);

    const renderContent = () => {
        if (isLoading) return <CardSkeletons count={4} />;
        if (error) return <LoadError message={error} onRetry={reload} />;
        if (operations.length === 0) {
            return <EmptyState message="Zurzeit sind keine Einträge verfügbar." />;
        }

        return (
            <>
                <OperationFilter
                    value={filter}
                    onChange={setFilter}
                    types={types}
                    resultCount={visible.length}
                    totalCount={operations.length}
                />

                {visible.length === 0 ? (
                    <EmptyState message="Zu dieser Auswahl gibt es keine Einträge. Bitte Filter ändern." />
                ) : (
                    <>
                        {/* key am Stagger: bei jedem Filterwechsel blenden die
                            Karten neu ein, statt stumm auszutauschen. */}
                        <Stagger key={`${filter.kind}-${filter.typeId}-${featured.length}`}>
                            <Grid container spacing={{ xs: 3, md: 4 }}>
                                {featured.map((item) => (
                                    <Grid item xs={12} lg={6} key={item.id}>
                                        <StaggerItem>
                                            <ImageWithTextBox
                                                text={item.type?.name_short ?? ""}
                                                kind={item.kind}
                                                title={item.title}
                                                imageUrl={item.headline_image_rendered}
                                                boxInfo={item.headline || item.content}
                                                date={dateFormatter.format(item.date)}
                                                id={String(item.id)}
                                            />
                                        </StaggerItem>
                                    </Grid>
                                ))}
                            </Grid>
                        </Stagger>

                        {remaining.length > 0 && (
                            <>
                                <Box sx={{ display: "flex", justifyContent: "center", py: { xs: 4, md: 6 } }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        aria-expanded={showMore}
                                        startIcon={showMore ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        onClick={() => setShowMore((previous) => !previous)}
                                    >
                                        {showMore
                                            ? "Weniger anzeigen"
                                            : `Weitere ${remaining.length} anzeigen`}
                                    </Button>
                                </Box>

                                <Presence initial={false}>
                                    {showMore && (
                                        <motion.div
                                            key="table"
                                            initial={reduced ? { opacity: 1 } : { opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={reduced ? { opacity: 1 } : { opacity: 0, height: 0 }}
                                            transition={{ duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                                            style={{ overflow: "hidden" }}
                                        >
                                            <TaetigkeitenTable taetigkeiten={remaining} />
                                        </motion.div>
                                    )}
                                </Presence>
                            </>
                        )}
                    </>
                )}
            </>
        );
    };

    return (
        <>
            <ParallaxSection
                image="sam_3937.jpg"
                eyebrow="Was wir tun"
                headerText="Einsätze & Tätigkeiten"
                headerSize="h1"
                heightInRem={26}
                polygon="polygon(0 0, 100% 0, 100% 90%, 0 100%)"
            />

            <Container maxWidth="lg" sx={{ py: { xs: 5, md: 9 } }}>
                <SectionHeading
                    eyebrow="Chronik"
                    title="Einsätze und Tätigkeiten"
                    subtitle="Einsätze sind rot gekennzeichnet, Tätigkeiten wie Übungen und Veranstaltungen gelb. Über die Filter lässt sich beides getrennt betrachten."
                />
                {renderContent()}
            </Container>
        </>
    );
};

export default Taetigkeiten;
