"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const { logout } = useAuth();
    const pathname = usePathname();

    const visiblePaths = ["/generate", "/library"];
    if (!visiblePaths.includes(pathname)) {
        return null;
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/80 backdrop-blur-md px-3 sm:px-6 lg:px-8">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">

                {/* Logo */}
                <div className="flex items-center shrink-0">
                    <Link
                        href="/"
                        className="text-lg sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent hover:opacity-80 transition"
                    >
                        NeuralArt
                    </Link>
                </div>

                {/* Navigation Links & Button */}
                <div className="flex items-center space-x-3 sm:space-x-6">
                    <Link
                        href="/generate"
                        className="text-xs sm:text-sm font-semibold text-gray-300 hover:text-purple-400 transition"
                    >
                        Create
                    </Link>
                    <Link
                        href="/library"
                        className="text-xs sm:text-sm font-semibold text-gray-300 hover:text-pink-400 transition"
                    >
                        Library
                    </Link>
                    <button
                        onClick={logout}
                        className="rounded-full border border-gray-600 bg-gray-800 px-3 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-bold text-white hover:bg-gray-700 transition shadow-lg shrink-0"
                    >
                        Log out
                    </button>
                </div>

            </div>
        </nav>
    );
}