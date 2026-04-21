"use client";

import GeneratorWidget from "@/components/GeneratorWidget";

export default function GeneratePage() {
    return (
        <div className="flex min-h-[calc(100vh-65px)] flex-col items-center pt-24 pb-12 bg-gray-900 text-white px-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 sm:mb-12 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent text-center px-2">
                Neural Style Transfer
            </h1>

            <GeneratorWidget isPublic={false} />
        </div>
    );
}