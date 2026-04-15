

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col items-center bg-gray-900 px-4 text-center pt-32 pb-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
          <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent block mb-4 text-6xl sm:text-7xl">
            NeuralArt
          </span>
          Transform Your Photos with{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            AI
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-1xl text-lg text-gray-300">
          Upload your photos and apply the visual style of your favourite artwork using Neural Style Transfer.
        </p>

        <div className="mt-10 mb-24 flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Link
            href="/try"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 text-base font-bold text-white hover:opacity-90 transition md:py-4 md:text-lg"
          >
            Try It Out
          </Link>
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

        <div className="w-full max-w-5xl mx-auto mb-8 px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">

            <div className="flex flex-col items-center">
              <div className="h-40 w-40 sm:h-48 sm:w-48 rounded-xl p-[2px] bg-gradient-to-r from-purple-400 to-pink-600 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <div className="relative h-full w-full rounded-[10px] overflow-hidden bg-gray-800">
                  <Image
                    src="/demo-content.jpg"
                    alt="Original Content"
                    fill
                    priority
                    unoptimized={true}
                    sizes="(max-width: 640px) 160px, 192px"
                    className="object-cover opacity-80 hover:opacity-100 transition"
                  />
                </div>
              </div>
              <span className="mt-4 text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Content Photo</span>
            </div>

            <div className="text-4xl font-light bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">+</div>

            <div className="flex flex-col items-center">
              <div className="h-40 w-40 sm:h-48 sm:w-48 rounded-xl p-[2px] bg-gradient-to-r from-purple-400 to-pink-600 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <div className="relative h-full w-full rounded-[10px] overflow-hidden bg-gray-800">
                  <Image
                    src="/demo-style.jpg"
                    alt="Art Style"
                    fill
                    priority
                    unoptimized={true}
                    sizes="(max-width: 640px) 160px, 192px"
                    className="object-cover opacity-80 hover:opacity-100 transition"
                  />
                </div>
              </div>
              <span className="mt-4 text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Style Artwork</span>
            </div>

            <div className="text-4xl font-light bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent hidden md:block">=</div>
            <div className="text-4xl font-light bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent md:hidden">↓</div>

            <div className="flex flex-col items-center">
              <div className="h-48 w-48 sm:h-56 sm:w-56 rounded-xl p-[2px] bg-gradient-to-r from-purple-400 to-pink-600 shadow-[0_0_25px_rgba(236,72,153,0.4)]">
                <div className="relative h-full w-full rounded-[10px] overflow-hidden bg-gray-800">
                  <Image
                    src="/demo-output.jpg"
                    alt="Final AI Generation"
                    fill
                    priority
                    unoptimized={true}
                    sizes="(max-width: 640px) 192px, 224px"
                    className="object-cover"
                  />
                </div>
              </div>
              <span className="mt-4 text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Final Result</span>
            </div>

          </div>
        </div>

      </div>

      <footer className="w-full bg-gray-900 py-3 text-center text-gray-500 text-sm border-t border-gray-800">
        <p>&copy; {new Date().getFullYear()} NeuralArt · <Link href="/privacy" className="hover:text-purple-400 transition">Privacy Policy</Link></p>
      </footer>
    </div>
  );
}