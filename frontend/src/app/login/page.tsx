"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                <div className="hidden lg:flex w-[28rem] rounded-l-2xl border border-r-0 border-gray-700 overflow-hidden relative">
                    <Image
                        src="/demo-output.jpg"
                        alt="Neural Style Transfer example"
                        fill
                        priority
                        unoptimized={true}
                        sizes="448px"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8 z-10">
                        <h2 className="mt-2 text-2xl font-extrabold text-white leading-tight">
                            Transform your photos into{" "}
                            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                                stunning art
                            </span>
                        </h2>
                    </div>
                </div>

                {/* Login form card */}
                <div className="w-full lg:w-[28rem] space-y-8 rounded-2xl lg:rounded-l-none border border-gray-700 bg-gray-800 p-8 shadow-2xl">
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
                                    className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm transition"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    required
                                    className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm transition"
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
                                className="group relative flex w-full justify-center items-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-sm font-bold text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign in"
                                )}
                            </button>
                        </div>
                    </form>
                    <div className="text-center text-sm text-gray-400 mt-4">
                        Don't have an account?{" "}
                        <Link href="/signup" className="font-semibold text-purple-400 hover:text-pink-400 transition">
                            Sign up here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}