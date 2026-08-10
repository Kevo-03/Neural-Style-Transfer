"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

interface ServiceStatusContextType {
    /** Whether the "service unavailable" banner is currently shown. */
    isBannerVisible: boolean;
    /** Bumped every time the alert is re-triggered, so the banner can replay its animation. */
    pulseKey: number;
    dismissBanner: () => void;
    /**
     * Call from any action that would have hit the backend. Re-shows the banner
     * (even if the user closed it) and scrolls it back into view.
     */
    reportUnavailable: () => void;
}

const ServiceStatusContext = createContext<ServiceStatusContextType | undefined>(undefined);

/**
 * Flip back to `true` once the backend is hosted again — every action that calls
 * the API is gated on this, and the banner in the layout is driven by it too.
 */
// Explicitly typed as `boolean` so TypeScript keeps both branches live rather
// than narrowing to the `false` literal and treating the rest as dead code.
export const BACKEND_AVAILABLE: boolean = false;

/** Styling for controls that are switched off while the backend is down. */
export const DISABLED_ACTION_CLASS = "opacity-50 cursor-not-allowed hover:opacity-50";

export const ServiceStatusProvider = ({ children }: { children: React.ReactNode }) => {
    const [isBannerVisible, setIsBannerVisible] = useState(!BACKEND_AVAILABLE);
    const [pulseKey, setPulseKey] = useState(0);

    const dismissBanner = useCallback(() => setIsBannerVisible(false), []);

    const reportUnavailable = useCallback(() => {
        setIsBannerVisible(true);
        setPulseKey((key) => key + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <ServiceStatusContext.Provider
            value={{ isBannerVisible, pulseKey, dismissBanner, reportUnavailable }}
        >
            {children}
        </ServiceStatusContext.Provider>
    );
};

export const useServiceStatus = () => {
    const context = useContext(ServiceStatusContext);
    if (context === undefined) {
        throw new Error("useServiceStatus must be used within a ServiceStatusProvider");
    }
    return context;
};
