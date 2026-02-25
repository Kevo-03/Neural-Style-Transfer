"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

interface ImageJob {
    id: number;
    status: string;
    result: string | null;
}

export default function LibraryPage() {
    const { isAuthenticated, isCheckingAuth } = useAuth();
    const router = useRouter();

    const [images, setImages] = useState<ImageJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isAuthenticated && !isCheckingAuth) {
            router.push("/login");
        }
    }, [isAuthenticated, isCheckingAuth, router]);

    useEffect(() => {
        const fetchLibrary = async () => {
            if (!isAuthenticated) return;

            try {
                const response = await api.get("/library");
                setImages(response.data);
            } catch (err) {
                console.error("Failed to fetch library", err);
                setError("Could not load your images.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLibrary();
    }, [isAuthenticated]);

    if (isCheckingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    My Library
                </h1>

                {isLoading ? (
                    <div className="text-center text-gray-400 mt-10 flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                        Loading your masterpieces...
                    </div>
                ) : error ? (
                    <div className="text-center text-red-400 mt-10 bg-red-900/30 p-4 rounded-lg border border-red-500/50 inline-block">
                        {error}
                    </div>
                ) : images.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10 p-8 border border-dashed border-gray-700 rounded-xl bg-gray-800/50">
                        You haven't generated any images yet. Head over to the Create tab!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {images.map((img) => (
                            <div key={img.id} className="overflow-hidden rounded-xl bg-gray-800 border border-gray-700 shadow-xl transition hover:border-purple-500/50">
                                {img.status === "COMPLETED" && img.result ? (
                                    <img
                                        src={img.result}
                                        alt={`Generated Art ${img.id}`}
                                        className="h-64 w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-64 w-full items-center justify-center bg-gray-900 text-sm font-medium text-gray-500 border-b border-gray-700">
                                        <span className="flex items-center gap-2">
                                            {img.status === "PROCESSING" && <Loader2 className="w-4 h-4 animate-spin" />}
                                            {img.status}
                                        </span>
                                    </div>
                                )}
                                <div className="bg-gray-800/80 px-4 py-3 border-t border-gray-700 flex justify-between items-center">
                                    <p className="text-sm font-bold text-white">Job #{img.id}</p>
                                    <p className={`text-xs font-semibold capitalize ${img.status === 'COMPLETED' ? 'text-green-400' :
                                        img.status === 'FAILED' ? 'text-red-400' : 'text-yellow-400'
                                        }`}>
                                        {img.status.toLowerCase()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}