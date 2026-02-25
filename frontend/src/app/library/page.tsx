"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api"; // Adjust this path to your Axios instance
import { Loader2 } from "lucide-react";

// Define the shape of the data coming from your backend
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

    // 🛡️ FRONTEND BOUNCER
    useEffect(() => {
        if (!isAuthenticated && !isCheckingAuth) {
            router.push("/login");
        }
    }, [isAuthenticated, isCheckingAuth, router]);
    // 📥 FETCH THE GALLERY
    useEffect(() => {
        const fetchLibrary = async () => {
            if (!isAuthenticated) return;

            try {
                // Look how clean this is! The interceptor handles the token automatically.
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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Library</h1>

            {isLoading ? (
                <div className="text-center text-gray-500 mt-10">Loading your masterpieces...</div>
            ) : error ? (
                <div className="text-center text-red-500 mt-10">{error}</div>
            ) : images.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                    You haven't generated any images yet. Head over to the Create tab!
                </div>
            ) : (
                /* 🖼️ THE CSS GRID */
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {images.map((img) => (
                        <div key={img.id} className="overflow-hidden rounded-lg bg-white shadow">
                            {img.status === "COMPLETED" && img.result ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={img.result}
                                    alt={`Generated Art ${img.id}`}
                                    className="h-64 w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-64 w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
                                    {img.status}
                                </div>
                            )}
                            <div className="bg-gray-50 px-4 py-3 border-t">
                                <p className="text-sm font-medium text-gray-900">Job #{img.id}</p>
                                <p className="text-xs text-gray-500 capitalize">{img.status.toLowerCase()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}