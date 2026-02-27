"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loader2, Download, Trash2, AlertCircle, X } from "lucide-react";

interface ImageJob {
    id: number;
    status: string;
    result: string | null;
}

export default function LibraryPage() {

    const [images, setImages] = useState<ImageJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [imageToDelete, setImageToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchLibrary = async () => {
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
    }, []);

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => {
                setToastMessage(null);
            }, 3000); // Disappears after 3 seconds
            return () => clearTimeout(timer); // Cleanup if the component unmounts
        }
    }, [toastMessage]);

    const handleDownload = async (imageUrl: string, img_id: number) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;

            a.download = `neural_art_${img_id}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download image:", error);
            // Optionally, you could set an error state here to show a toast notification
            setToastMessage("Could not download the image. Please try right-clicking and saving.");
        }
    };

    const handleDeleteClick = (img_id: number) => {
        setImageToDelete(img_id);
    };

    const confirmDelete = async () => {
        if (!imageToDelete) return;

        setIsDeleting(true);
        try {
            await api.delete(`/library/${imageToDelete}`);
            setImages((prevImages) => prevImages.filter((img) => img.id !== imageToDelete));
            setImageToDelete(null);
        } catch (error) {
            console.error("Failed to delete image:", error);
            setToastMessage("Could not delete the image. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };


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
                                {img.status === "COMPLETED" && img.result && (
                                    <button
                                        onClick={() => handleDownload(img.result!, img.id)}
                                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition"
                                        title="Download Image"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDeleteClick(img.id)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/30 transition"
                                    title="Delete Image"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {imageToDelete !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="w-full max-w-sm rounded-2xl bg-gray-800 border border-gray-700 p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200">

                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-900/30 rounded-full text-red-500">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Delete Image?</h3>
                        </div>

                        <p className="text-gray-400 text-sm mb-6">
                            Are you sure you want to delete this masterpiece? This action will permanently remove it from your library and cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setImageToDelete(null)}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:bg-gray-700 hover:text-white transition disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex items-center px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition shadow-lg shadow-red-900/20 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Yes, Delete"
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            )}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-red-900/90 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm font-medium">{toastMessage}</p>
                    <button
                        onClick={() => setToastMessage(null)}
                        className="ml-2 text-red-400 hover:text-white transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}