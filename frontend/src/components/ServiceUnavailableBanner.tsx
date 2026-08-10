"use client";

import { AlertTriangle } from "lucide-react";
import { useServiceStatus } from "@/context/ServiceStatusContext";

export default function ServiceUnavailableBanner() {
    const { isBannerVisible, pulseKey, dismissBanner } = useServiceStatus();

    if (!isBannerVisible) {
        return null;
    }

    return (
        // Re-keying on pulseKey remounts the banner so the animation replays
        // when an action re-triggers the alert.
        <div
            key={pulseKey}
            role="alert"
            className="w-full border-b border-amber-500/30 bg-amber-500/10 backdrop-blur-md px-3 sm:px-6 lg:px-8 py-2.5 animate-fade-in"
        >
            <div className="mx-auto flex max-w-7xl items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-amber-200">
                    <span className="font-bold">Service unavailable — </span>
                    the backend is no longer hosted, so generating art, signing up and logging
                    in are currently disabled. The site is browsable as a demo only.
                </p>
                <button
                    onClick={dismissBanner}
                    aria-label="Dismiss notice"
                    className="ml-auto flex-shrink-0 rounded-full px-2 py-1 text-xs sm:text-sm font-bold text-amber-300 hover:bg-amber-500/20 hover:text-amber-100 transition"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
