"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { BACKEND_AVAILABLE, DISABLED_ACTION_CLASS, useServiceStatus } from "@/context/ServiceStatusContext";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { reportUnavailable } = useServiceStatus();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // The backend is no longer hosted — surface the notice instead of failing a request.
        if (!BACKEND_AVAILABLE) {
            reportUnavailable();
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await login(username, password);
        } catch (err: any) {
            if (err?.response?.status === 429) {
                setError("Too many login attempts. Please try again later.");
            } else {
                setError("Invalid username or password. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
            <div className="flex flex-col lg:flex-row items-stretch">
                {/* NST showcase card */}
                <div className="hidden lg:flex w-[28rem] rounded-l-2xl border border-r-0 border-white/10 overflow-hidden relative">
                    <Image
                        src="/demo-output.jpg"
                        alt="Neural Style Transfer example"
                        fill
                        preload
                        unoptimized={true}
                        sizes="448px"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8 z-10">
                        <h2 className="mt-2 text-2xl font-extrabold text-white leading-tight">
                            Transform your photos into{" "}
                            <span className="text-indigo-400">
                                stunning art
                            </span>
                        </h2>
                    </div>
                </div>

                {/* Login form card */}
                <div className="w-full lg:w-[28rem] space-y-8 rounded-2xl lg:rounded-l-none border border-white/10 bg-gray-800/40 backdrop-blur-xl p-8 shadow-2xl">
                    <div>
                        <h2 className="text-center text-3xl font-extrabold text-white">
                            Welcome Back
                        </h2>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-lg bg-red-900/30 p-3 border border-red-500/50 text-red-200 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                aria-disabled={!BACKEND_AVAILABLE || isLoading}
                                title={!BACKEND_AVAILABLE ? "Unavailable — the backend is no longer hosted" : undefined}
                                // Cancelling the click skips HTML validation, so the notice
                                // shows even when the fields are empty.
                                onClick={(e) => {
                                    if (!BACKEND_AVAILABLE) {
                                        e.preventDefault();
                                        reportUnavailable();
                                    }
                                }}
                                className={`group relative flex w-full justify-center items-center rounded-lg bg-indigo-500 px-4 py-3 text-sm font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${!BACKEND_AVAILABLE ? DISABLED_ACTION_CLASS : "hover:opacity-90"}`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Logging In...
                                    </>
                                ) : (
                                    "Log In"
                                )}
                            </button>
                        </div>
                    </form>
                    <div className="text-center text-sm text-gray-400 mt-4">
                        Don't have an account?{" "}
                        <Link href="/signup" className="font-bold text-indigo-400 hover:opacity-80 transition">
                            Sign Up here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}