"use client";

import GeneratorWidget from "@/components/GeneratorWidget";
import Link from "next/link";

export default function TryPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-900">
            <div className="flex-1 flex flex-col items-center px-4 pt-24 pb-16">
                <h1 className="text-4xl font-extrabold text-white mb-2">
                    Try{" "}
                    <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        NeuralArt
                    </span>
                </h1>
                <p className="text-gray-400 mb-12">
                    No credit card or account required.
                </p>

                <div className="w-full max-w-5xl">
                    <GeneratorWidget isPublic={true} />
                </div>
            </div>

            <footer className="w-full bg-gray-900 py-3 text-center text-gray-500 text-sm border-t border-gray-800">
                <p>&copy; {new Date().getFullYear()} NeuralArt · <Link href="/privacy" className="hover:text-purple-400 transition">Privacy Policy</Link></p>
            </footer>
        </div>
    );
}
