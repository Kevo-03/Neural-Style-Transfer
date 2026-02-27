"use client";

import Link from "next/link";
import { Ghost } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center bg-gray-900 px-4 text-center">

            {/* The 404 Icon & Glitch text */}
            <div className="flex flex-col items-center justify-center space-y-4 animate-in zoom-in duration-500">
                <div className="rounded-full bg-purple-900/30 p-6 text-purple-400 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                    <Ghost className="h-16 w-16 animate-bounce" />
                </div>
                <h1 className="text-7xl font-extrabold tracking-tighter text-white drop-shadow-lg">
                    4<span className="text-purple-500">0</span>4
                </h1>
            </div>

            {/* The Message */}
            <div className="mt-6 max-w-md space-y-3">
                <h2 className="text-2xl font-bold text-gray-200">
                    Lost in the Latent Space
                </h2>
                <p className="text-gray-400 text-sm">
                    It looks like the page you are looking for has been painted over or doesn't exist. Let's get you back to the gallery.
                </p>
            </div>

            {/* The Escape Route */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                    href="/library"
                    className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:opacity-90 transition"
                >
                    Go to My Library
                </Link>
                <Link
                    href="/generate"
                    className="inline-flex items-center justify-center rounded-lg border border-gray-600 bg-gray-800 px-6 py-3 text-sm font-bold text-gray-300 shadow-lg hover:bg-gray-700 hover:text-white transition"
                >
                    Create New Art
                </Link>
            </div>

        </div>
    );
}