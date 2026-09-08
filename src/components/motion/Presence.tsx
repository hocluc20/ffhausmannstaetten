import React from "react";
import { AnimatePresence as AnimatePresenceRaw } from "motion/react";

/**
 * AnimatePresence mit korrigierter Typangabe.
 *
 * Die mitgelieferte Deklaration gibt `Element | undefined` zurueck, was
 * TypeScript nicht als gueltiges JSX-Element akzeptiert.
 */
const Presence = AnimatePresenceRaw as unknown as React.FC<{
    children?: React.ReactNode;
    mode?: "sync" | "wait" | "popLayout";
    initial?: boolean;
}>;

export default Presence;
