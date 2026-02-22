"use client";

import { useState } from "react";
import api from "@/lib/api";
import { UploadCloud, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function Home() {
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [styleFile, setStyleFile] = useState<File | null>(null);

  // UI States
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<string>("IDLE"); // IDLE, UPLOADING, PROCESSING, COMPLETED, FAILED
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
          // The backend returns a file path. We need to convert it to a URL.
          // For now, we'll just log it. (We will fix the URL display in the next step)
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-24">
      <h1 className="text-5xl font-extrabold mb-12 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
        Neural Style Transfer
      </h1>

      {/* Input Section - Only show if we are NOT done */}
      {status !== "COMPLETED" && (
        <div className="grid grid-cols-2 gap-8 w-full max-w-4xl animate-fade-in">
          {/* Content Image */}
          <div className={`flex flex-col items-center gap-4 p-8 border-2 border-dashed rounded-xl transition ${contentFile ? 'border-purple-500 bg-gray-800' : 'border-gray-700 hover:border-gray-500'}`}>
            <ImageIcon className="w-12 h-12 text-gray-400" />
            <h2 className="text-xl font-semibold">Content Image</h2>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setContentFile)}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          {/* Style Image */}
          <div className={`flex flex-col items-center gap-4 p-8 border-2 border-dashed rounded-xl transition ${styleFile ? 'border-pink-500 bg-gray-800' : 'border-gray-700 hover:border-gray-500'}`}>
            <UploadCloud className="w-12 h-12 text-gray-400" />
            <h2 className="text-xl font-semibold">Style Image</h2>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setStyleFile)}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
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

            {/* Placeholder for the Result Image */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-gray-300">Image Path from DB: <br /><code className="text-yellow-500">{resultImage}</code></p>
              <p className="text-sm text-gray-500 mt-2">(We need to fix the backend to serve this file next!)</p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              Create Another
            </button>
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