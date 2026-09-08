import React from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

type Direction = "up" | "down" | "left" | "right" | "none";

const offset = (direction: Direction, distance: number) => {
    switch (direction) {
        case "up":
            return { y: distance };
        case "down":
            return { y: -distance };
        case "left":
            return { x: distance };
        case "right":
            return { x: -distance };
        default:
            return {};
    }
};

const EASE = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
    children: React.ReactNode;
    direction?: Direction;
    /** Verschiebung in Pixeln, aus der eingeblendet wird. */
    distance?: number;
    delay?: number;
    duration?: number;
    /** Einmalig einblenden statt bei jedem Scrolldurchgang. */
    once?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Blendet Inhalte ein, sobald sie in den sichtbaren Bereich scrollen.
 *
 * Bei "reduzierte Bewegung" wird ohne Versatz und ohne Dauer gerendert -
 * der Inhalt ist dann sofort da, statt zu animieren.
 */
export const Reveal: React.FC<RevealProps> = ({
    children,
    direction = "up",
    distance = 28,
    delay = 0,
    duration = 0.55,
    once = true,
    className,
    style,
}) => {
    const reduced = useReducedMotion();

    return (
        <motion.div
            className={className}
            style={style}
            initial={reduced ? { opacity: 1 } : { opacity: 0, ...offset(direction, distance) }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once, amount: 0.2, margin: "0px 0px -60px 0px" }}
            transition={reduced ? { duration: 0 } : { duration, delay, ease: EASE }}
        >
            {children}
        </motion.div>
    );
};

interface StaggerProps {
    children: React.ReactNode;
    /** Abstand zwischen den Kindern in Sekunden. */
    step?: number;
    once?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Container, dessen Kinder nacheinander eingeblendet werden.
 * Die Kinder muessen <StaggerItem> verwenden.
 */
export const Stagger: React.FC<StaggerProps> = ({
    children,
    step = 0.09,
    once = true,
    className,
    style,
}) => {
    const reduced = useReducedMotion();

    const variants: Variants = {
        hidden: {},
        show: { transition: { staggerChildren: reduced ? 0 : step } },
    };

    return (
        <motion.div
            className={className}
            style={style}
            variants={variants}
            initial="hidden"
            whileInView="show"
            viewport={{ once, amount: 0.15 }}
        >
            {children}
        </motion.div>
    );
};

export const staggerItemVariants = (reduced: boolean | null): Variants => ({
    hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 26 },
    show: {
        opacity: 1,
        y: 0,
        transition: reduced ? { duration: 0 } : { duration: 0.5, ease: EASE },
    },
});

interface StaggerItemProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, className, style }) => {
    const reduced = useReducedMotion();
    return (
        <motion.div className={className} style={style} variants={staggerItemVariants(reduced)}>
            {children}
        </motion.div>
    );
};

export default Reveal;
