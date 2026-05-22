"use client";

import GeneratorWidget from "@/components/GeneratorWidget";
import Link from "next/link";

export default function TryPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-900">
            <div className="flex-1 flex flex-col items-center px-4 pt-16 sm:pt-24 pb-12 sm:pb-16 text-center">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                    Try{" "}
                    <span className="text-indigo-400">
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
                <p>&copy; {new Date().getFullYear()} NeuralArt · <Link href="/privacy" className="hover:text-indigo-400 transition">Privacy Policy</Link></p>
            </footer>
        </div>
    );
}
