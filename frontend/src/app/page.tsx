import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
        Transform Your Photos with <span className="text-indigo-600">AI</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500">
        Upload your photos and apply the visual style of famous artworks using our advanced Neural Style Transfer engine.
      </p>

      <div className="mt-10 flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:text-lg"
        >
          Get Started for Free
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-100 px-8 py-3 text-base font-medium text-indigo-700 hover:bg-indigo-200 md:py-4 md:text-lg"
        >
          Log In
        </Link>
      </div>
    </div>
  );
}