"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { UploadCloud, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, Download } from "lucide-react";

export default function GeneratePage() {
    const [contentFile, setContentFile] = useState<File | null>(null);
    const [styleFile, setStyleFile] = useState<File | null>(null);
    const [contentPreview, setContentPreview] = useState<string | null>(null);
    const [stylePreview, setStylePreview] = useState<string | null>(null);
    // UI States
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<string>("IDLE"); // IDLE, UPLOADING, PROCESSING, COMPLETED, FAILED
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isDraggingContent, setIsDraggingContent] = useState(false);
    const [isDraggingStyle, setIsDraggingStyle] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);


    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setFile: (f: File) => void,
        setPreview: (p: string) => void
    ) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFile(file);
            setPreview(URL.createObjectURL(file));
            setErrorMessage(null);
        }
    };

    // --- THE NEW PART: POLLING LOGIC ---
    const pollStatus = async (id: number) => {
        const interval = setInterval(async () => {
            try {
                const res = await api.get(`/status/${id}`);
                const jobStatus = res.data.status;
                console.log("Polling...", jobStatus);

                if (jobStatus === "COMPLETED") {
                    clearInterval(interval); // Stop asking!
                    setStatus("COMPLETED");
                    setResultImage(res.data.result);
                } else if (jobStatus === "FAILED") {
                    clearInterval(interval);
                    setStatus("FAILED");
                } else {
                    setStatus("PROCESSING");
                }
            } catch (error) {
                console.error("Polling error", error);
                clearInterval(interval);
                setStatus("FAILED");
            }
        }, 3000); // Check every 3 seconds
    };

    const handleUpload = async () => {
        if (!contentFile || !styleFile) return;

        setIsUploading(true);
        setStatus("UPLOADING");

        const formData = new FormData();
        formData.append("content_file", contentFile);
        formData.append("style_file", styleFile);

        try {
            const response = await api.post("/generate", formData);
            const dbId = response.data.database_id;

            setStatus("PROCESSING");
            pollStatus(dbId); // Start the loop!

        } catch (error) {
            console.error("Upload failed", error);
            setStatus("FAILED");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, setDragging: (b: boolean) => void) => {
        e.preventDefault(); // Crucial: prevents the browser from opening the file
        setDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, setDragging: (b: boolean) => void) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDrop = (
        e: React.DragEvent<HTMLDivElement>,
        setFile: (f: File) => void,
        setPreview: (url: string) => void,
        setDragging: (b: boolean) => void
    ) => {
        e.preventDefault();
        setDragging(false); // Turn off the highlight effect

        // The files from a drop live in e.dataTransfer, not e.target!
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];

            // Quick safety check to ensure they dropped an image
            if (!file.type.startsWith("image/")) {
                setErrorMessage("Whoops! Please drop a valid image file (JPEG, PNG, etc.).");
                return;
            }

            setFile(file);
            setPreview(URL.createObjectURL(file));
            setErrorMessage(null);
        }
    };

    const handleDownload = async () => {
        if (!resultImage) return;

        try {
            // 1. Fetch the raw binary data of the image from your FastAPI server
            const response = await fetch(resultImage);
            const blob = await response.blob();

            // 2. Create a temporary, invisible URL in the browser's memory
            const url = window.URL.createObjectURL(blob);

            // 3. Create an invisible HTML anchor <a> tag, click it, and remove it
            const a = document.createElement("a");
            a.href = url;
            a.download = "neural_art_masterpiece.jpg"; // The name it saves as
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // 4. Clean up the memory
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download image:", error);
            setErrorMessage("Could not download the image. Please try right-clicking and saving.");
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-24">
            <h1 className="text-5xl font-extrabold mb-12 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Neural Style Transfer
            </h1>
            {/* Custom Error Message Display */}
            {errorMessage && (
                <div className="flex items-center gap-3 w-full max-w-4xl p-4 mb-8 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                    <p className="font-medium">{errorMessage}</p>
                    <button
                        onClick={() => setErrorMessage(null)}
                        className="ml-auto text-red-400 hover:text-red-300 transition"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Input Section - Only show if we are NOT done */}
            {status !== "COMPLETED" && (
                <div className="grid grid-cols-2 gap-8 w-full max-w-4xl animate-fade-in">

                    {/* Content Image Box */}
                    <div
                        onDragOver={(e) => handleDragOver(e, setIsDraggingContent)}
                        onDragLeave={(e) => handleDragLeave(e, setIsDraggingContent)}
                        onDrop={(e) => handleDrop(e, setContentFile, setContentPreview, setIsDraggingContent)}
                        className={`flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-xl transition-all duration-200 relative overflow-hidden h-64 
              ${isDraggingContent ? 'border-purple-400 bg-gray-800 scale-[1.02] shadow-[0_0_15px_rgba(168,85,247,0.4)]' :
                                contentFile ? 'border-purple-500 bg-gray-800' : 'border-gray-700 hover:border-gray-500'}`}
                    >
                        {contentPreview ? (
                            <img src={contentPreview} alt="Content Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        ) : (
                            <ImageIcon className={`w-12 h-12 z-10 relative transition-colors ${isDraggingContent ? 'text-purple-400' : 'text-gray-400'}`} />
                        )}

                        <h2 className="text-xl font-semibold z-10 relative drop-shadow-md">Content Image</h2>
                        <p className="text-sm text-gray-400 z-10 relative font-medium">Drag & drop or click to upload</p>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, setContentFile, setContentPreview)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            title=""
                        />
                    </div>

                    {/* Style Image Box */}
                    <div
                        onDragOver={(e) => handleDragOver(e, setIsDraggingStyle)}
                        onDragLeave={(e) => handleDragLeave(e, setIsDraggingStyle)}
                        onDrop={(e) => handleDrop(e, setStyleFile, setStylePreview, setIsDraggingStyle)}
                        className={`flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-xl transition-all duration-200 relative overflow-hidden h-64 
              ${isDraggingStyle ? 'border-pink-400 bg-gray-800 scale-[1.02] shadow-[0_0_15px_rgba(236,72,153,0.4)]' :
                                styleFile ? 'border-pink-500 bg-gray-800' : 'border-gray-700 hover:border-gray-500'}`}
                    >
                        {stylePreview ? (
                            <img src={stylePreview} alt="Style Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        ) : (
                            <UploadCloud className={`w-12 h-12 z-10 relative transition-colors ${isDraggingStyle ? 'text-pink-400' : 'text-gray-400'}`} />
                        )}

                        <h2 className="text-xl font-semibold z-10 relative drop-shadow-md">Style Image</h2>
                        <p className="text-sm text-gray-400 z-10 relative font-medium">Drag & drop or click to upload</p>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, setStyleFile, setStylePreview)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            title=""
                        />
                    </div>
                </div>
            )}
            {/* Button / Status Area */}
            <div className="mt-12">
                {status === "IDLE" && (
                    <button
                        onClick={handleUpload}
                        disabled={!contentFile || !styleFile}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Generate Art
                    </button>
                )}

                {status === "UPLOADING" && (
                    <div className="flex items-center gap-3 text-purple-400 text-xl animate-pulse">
                        <UploadCloud className="w-6 h-6" /> Uploading files...
                    </div>
                )}

                {status === "PROCESSING" && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3 text-yellow-400 text-xl">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            Painting your masterpiece...
                        </div>
                        <p className="text-sm text-gray-500">This usually takes about 10-20 seconds.</p>
                    </div>
                )}

                {status === "COMPLETED" && (
                    <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                        <div className="flex items-center gap-2 text-green-400 text-2xl font-bold">
                            <CheckCircle className="w-8 h-8" /> Done!
                        </div>

                        {resultImage && (
                            <div className="relative p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-2xl">
                                <img
                                    src={resultImage}
                                    alt="Generated Masterpiece"
                                    className="w-full max-w-2xl rounded-lg object-cover"
                                />
                            </div>
                        )}

                        {/* NEW: Action Buttons Row */}
                        <div className="flex items-center gap-4 mt-4">
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 transition font-semibold shadow-lg"
                            >
                                <Download className="w-5 h-5" />
                                Download Art
                            </button>

                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 border border-gray-600 bg-gray-800 rounded-lg hover:bg-gray-700 transition font-semibold"
                            >
                                Create Another
                            </button>
                        </div>
                    </div>
                )}
                {status === "FAILED" && (
                    <div className="flex items-center gap-3 text-red-500 text-xl">
                        <AlertCircle className="w-6 h-6" /> Something went wrong. Check the console.
                    </div>
                )}
            </div>
        </main>
    );
}