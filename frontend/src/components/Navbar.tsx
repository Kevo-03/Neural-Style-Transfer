"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    // We only need logout now! The middleware handles the rest.
    const { logout } = useAuth();
    const pathname = usePathname();

    // 1. THE INVISIBILITY CLOAK
    // Hide the navbar entirely on public/auth pages
    const hiddenPaths = ["/", "/login", "/signup"];
    if (hiddenPaths.includes(pathname)) {
        return null;
    }

    // 2. THE DASHBOARD NAVBAR
    // If the code reaches here, the middleware GUARANTEES they have a valid cookie.
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">

                {/* LEFT SIDE: Brand / Logo */}
                <div className="flex items-center">
                    <Link
                        href="/"
                        className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent hover:opacity-80 transition"
                    >
                        NeuralArt
                    </Link>
                </div>

                {/* RIGHT SIDE: Guaranteed Authenticated Links */}
                <div className="flex items-center space-x-6">
                    <Link
                        href="/generate"
                        className="text-sm font-semibold text-gray-300 hover:text-purple-400 transition"
                    >
                        Create
                    </Link>
                    <Link
                        href="/library"
                        className="text-sm font-semibold text-gray-300 hover:text-pink-400 transition"
                    >
                        My Library
                    </Link>
                    <button
                        onClick={logout}
                        className="rounded-full border border-gray-600 bg-gray-800 px-5 py-2 text-sm font-bold text-white hover:bg-gray-700 transition shadow-lg"
                    >
                        Log out
                    </button>
                </div>

            </div>
        </nav>
    );
}