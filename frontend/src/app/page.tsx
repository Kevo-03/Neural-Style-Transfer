"use client";

import Link from "next/link";
import GeneratorWidget from "@/components/GeneratorWidget";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center bg-gray-900 px-4 text-center pt-32 pb-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
          <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent block mb-4 text-6xl sm:text-7xl">
            NeuralArt
          </span>
          Transform Your Photos with{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            AI
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
          Upload your photos and apply the visual style of famous artworks using our advanced Neural Style Transfer engine.
        </p>

        {/* Buttons for those who want to sign up immediately */}
        <div className="mt-10 mb-24 flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 text-base font-bold text-white hover:opacity-90 transition md:py-4 md:text-lg"
          >
            Get Started for Free
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-gray-600 bg-gray-800 px-8 py-3 text-base font-bold text-white hover:bg-gray-700 transition md:py-4 md:text-lg"
          >
            Log In
          </Link>
        </div>

        {/* The new "Try it Free" Section */}
        <div className="w-full max-w-5xl mt-12 mb-24 pb-12 border-b border-gray-800">
          <h2 className="text-3xl font-bold text-white mb-2">Try it right now</h2>
          <p className="text-gray-400 mb-10">No credit card or account required.</p>

          {/* isPublic=true tells it to hit the open endpoint */}
          <GeneratorWidget isPublic={true} />
        </div>
      </div>

      <footer className="w-full bg-gray-900 py-6 text-center text-gray-500 text-sm border-t border-gray-800">
        <p>&copy; {new Date().getFullYear()} NeuralArt. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <Link href="/privacy" className="hover:text-purple-400 transition">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </>
  );
}