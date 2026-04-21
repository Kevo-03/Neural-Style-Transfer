'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteAccountButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const executeDeletion = async () => {
        setIsDeleting(true);
        setError('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/account`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                router.push('/');
                router.refresh();
            } else {
                const data = await response.json();
                setError(data.detail || "Failed to delete account. Please try again.");
                setIsDeleting(false);
                setIsModalOpen(false);
            }
        } catch (err) {
            console.error("Deletion error:", err);
            setError("A network error occurred while trying to delete your account.");
            setIsDeleting(false);
            setIsModalOpen(false);
        }
    };

    return (
        <div className="mt-8">
            <button
                onClick={() => setIsModalOpen(true)}
                className="text-red-500 hover:text-red-400 font-semibold text-sm transition-all border border-red-500/30 bg-red-900/10 backdrop-blur-md hover:bg-red-900/40 px-4 py-2 rounded-lg"
            >
                Delete Account
            </button>

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
                    <div className="bg-gray-900/80 backdrop-blur-xl border border-red-500/50 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-3">Are you absolutely sure?</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            This action cannot be undone. This will permanently delete your account, wipe all your uploaded images, and remove your generated artwork from our servers.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800/40 backdrop-blur-md border border-white/10 hover:bg-white/10 rounded-lg transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={executeDeletion}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg shadow-red-900/20"
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}