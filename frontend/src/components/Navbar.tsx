"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function Navbar() {
    const { isAuthenticated, isCheckingAuth, logout } = useAuth();

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

                {/* RIGHT SIDE: Dynamic Links */}
                <div className="flex items-center space-x-6">
                    {/* Prevent UI flashing while checking token */}
                    {isCheckingAuth ? (
                        <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                    ) : isAuthenticated ? (
                        <>
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
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm font-semibold text-gray-300 hover:text-white transition"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/signup"
                                className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2 text-sm font-bold text-white hover:opacity-90 transition shadow-lg shadow-purple-900/20"
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                </div>

            </div>
        </nav>
    );
}