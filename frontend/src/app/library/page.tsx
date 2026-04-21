import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LibraryGrid from "@/components/LibraryGrid";

interface ImageJob {
    id: number;
    status: string;
    result: string | null;
}

export default async function LibraryPage() {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    let images: ImageJob[] = [];
    let hasError = false;
    let status = 200;

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/library`,
            {
                headers: { Cookie: cookieHeader },
                cache: "no-store",
            }
        );

        status = res.status;

        if (res.ok) {
            images = await res.json();
        } else {
            hasError = true;
        }
    } catch {
        hasError = true;
    }

    if (status === 401) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    My Library
                </h1>

                <LibraryGrid initialImages={images} hasError={hasError} />
            </div>
        </div>
    );
}