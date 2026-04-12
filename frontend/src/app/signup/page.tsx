"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        setIsLoading(true);

        try {
            await signup(username, password);
        } catch (err) {
            setError("Could not create account. Username might already exist.");
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
                        src="/signup_photo.jpg"
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

                {/* Signup form card */}
                <div className="w-full lg:w-[28rem] space-y-8 rounded-2xl lg:rounded-l-none border border-gray-700 bg-gray-800 p-8 shadow-2xl">
                    <div>
                        <h2 className="text-center text-3xl font-extrabold text-white">
                            Create an Account
                        </h2>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-lg bg-red-900/30 p-3 border border-red-500/50 text-red-200 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <input
                                type="text"
                                required
                                className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm transition"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <div>
                                <input
                                    type="password"
                                    required
                                    className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm transition"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm transition"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex items-start mt-6 mb-2">
                            <div className="flex h-5 items-center">
                                <input
                                    id="privacy-consent"
                                    name="privacy-consent"
                                    type="checkbox"
                                    required
                                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
                                />
                            </div>
                            <div className="ml-3 text-sm text-left">
                                <label htmlFor="privacy-consent" className="text-gray-400">
                                    I agree to the{' '}
                                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-purple-400 hover:text-purple-300 underline">
                                        Privacy Policy
                                    </a>
                                    {' '}and consent to the processing of my images.
                                </label>
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
                                        Creating...
                                    </>
                                ) : (
                                    "Sign up"
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="text-center text-sm text-gray-400">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-purple-400 hover:text-pink-400 transition">
                            Log in here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}