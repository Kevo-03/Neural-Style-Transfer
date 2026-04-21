"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const { logout } = useAuth();
    const pathname = usePathname();

    /*  const hiddenPaths = ["/", "/login", "/signup", "/privacy"];
     if (hiddenPaths.includes(pathname)) {
         return null;
     }
  */
    const visiblePaths = ["/generate", "/library"];
    if (!visiblePaths.includes(pathname)) {
        return null;
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/80 backdrop-blur-md px-3 sm:px-6 lg:px-8">
            <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between">

                <div className="flex items-center">
                    <span className="text-lg sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent cursor-default">
                        NeuralArt
                    </span>
                </div>

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
                        My Library
                    </Link>
                    <button
                        onClick={logout}
                        className="rounded-full border border-white/10 bg-gray-800/40 backdrop-blur-md px-3 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-bold text-white hover:bg-white/10 transition shadow-lg whitespace-nowrap"
                    >
                        Log Out
                    </button>
                </div>

            </div>
        </nav>
    );
}