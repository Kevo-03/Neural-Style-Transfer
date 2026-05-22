

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col items-center bg-gray-900 px-4 text-center pt-16 sm:pt-32 pb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          <span className="text-indigo-400 block mb-4 text-5xl sm:text-7xl">
            NeuralArt
          </span>
          Transform Your Photos with{" "}
          <span className="text-indigo-400">
            AI
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-1xl text-lg text-gray-300">
          <span className="hidden sm:block">Upload your photos and apply the visual style of your favourite artwork using Neural Style Transfer</span>
          <span className="block mt-2 font-bold text-indigo-400">
            Sign up to store your photos in your library
          </span>
        </p>

        <div className="mt-10 mb-24 flex flex-row flex-wrap justify-center gap-2 sm:gap-4 w-full px-2 sm:px-0">
          <Link
            href="/try"
            className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-bold text-white hover:opacity-90 transition md:py-4 md:text-lg"
          >
            Try Out
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-bold text-white hover:opacity-90 transition md:py-4 md:text-lg"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-gray-800/40 backdrop-blur-md px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-bold text-white hover:bg-white/10 transition md:py-4 md:text-lg"
          >
            Log In
          </Link>
        </div>

        <div className="w-full max-w-5xl mx-auto mb-8 px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">

            {/* Mobile Row 1 / Desktop Left Columns */}
            <div className="flex flex-row items-center justify-center gap-2 sm:gap-6 md:gap-8">
              <div className="flex flex-col items-center animate-fade-in [animation-delay:100ms]">
                <div className="h-28 w-28 sm:h-48 sm:w-48 rounded-xl p-[2px] bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  <div className="relative h-full w-full rounded-[10px] overflow-hidden bg-gray-800">
                    <Image
                      src="/demo-content.jpg"
                      alt="Original Content"
                      fill
                      preload
                      unoptimized={true}
                      sizes="(max-width: 640px) 112px, 192px"
                      className="object-cover opacity-80 hover:opacity-100 transition"
                    />
                  </div>
                </div>
                <span className="mt-4 text-xs sm:text-sm font-bold text-indigo-400">Content Photo</span>
              </div>

              <div className="text-2xl sm:text-4xl font-light text-indigo-400">+</div>

              <div className="flex flex-col items-center animate-fade-in [animation-delay:300ms]">
                <div className="h-28 w-28 sm:h-48 sm:w-48 rounded-xl p-[2px] bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  <div className="relative h-full w-full rounded-[10px] overflow-hidden bg-gray-800">
                    <Image
                      src="/demo-style.jpg"
                      alt="Art Style"
                      fill
                      preload
                      unoptimized={true}
                      sizes="(max-width: 640px) 112px, 192px"
                      className="object-cover opacity-80 hover:opacity-100 transition"
                    />
                  </div>
                </div>
                <span className="mt-4 text-xs sm:text-sm font-bold text-indigo-400">Style Artwork</span>
              </div>
            </div>

            {/* Mobile Row 2 Arrow / Desktop Equals */}
            <div className="text-3xl sm:text-4xl font-light text-indigo-400 hidden md:block">=</div>
            <div className="text-3xl font-light text-indigo-400 md:hidden my-2">↓</div>

            {/* Mobile Row 3 / Desktop Right Column */}
            <div className="flex flex-col items-center animate-fade-in [animation-delay:500ms]">
              <div className="h-40 w-40 sm:h-56 sm:w-56 rounded-xl p-[2px] bg-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.4)]">
                <div className="relative h-full w-full rounded-[10px] overflow-hidden bg-gray-800">
                  <Image
                    src="/demo-output.jpg"
                    alt="Final AI Generation"
                    fill
                    preload
                    unoptimized={true}
                    sizes="(max-width: 640px) 192px, 224px"
                    className="object-cover"
                  />
                </div>
              </div>
              <span className="mt-4 text-sm font-bold text-indigo-400">Final Result</span>
            </div>

          </div>
        </div>

      </div>

      <footer className="w-full bg-gray-900 py-3 text-center text-gray-500 text-sm border-t border-gray-800">
        <p>&copy; {new Date().getFullYear()} NeuralArt · <Link href="/privacy" className="hover:text-indigo-400 transition">Privacy Policy</Link></p>
      </footer>
    </div>
  );
}