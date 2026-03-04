"use client";

import GeneratorWidget from "@/components/GeneratorWidget";

export default function GeneratePage() {
    return (
        <main className="flex min-h-screen flex-col items-center pt-24 pb-12 bg-gray-900 text-white px-4">
            <h1 className="text-5xl font-extrabold mb-12 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent text-center">
                Neural Style Transfer
            </h1>

            {/* isPublic=false means it will hit the secure endpoint and save to the DB */}
            <GeneratorWidget isPublic={false} />
        </main>
    );
}