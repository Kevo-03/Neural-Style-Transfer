"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isCheckingAuth } = useAuth();
  const router = useRouter();

  // 🛡️ THE REVERSE BOUNCER: If they are already logged in, send them to the app!
  useEffect(() => {
    if (!isCheckingAuth && isAuthenticated) {
      router.push("/library");
    }
  }, [isAuthenticated, isCheckingAuth, router]);

  // Prevent UI flash while checking
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gray-900 px-4 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
        Transform Your Photos with{" "}
        <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          AI
        </span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
        Upload your photos and apply the visual style of famous artworks using our advanced Neural Style Transfer engine.
      </p>

      <div className="mt-10 flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
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
    </div>
  );
}