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
                className="text-red-500 hover:text-red-400 font-semibold text-sm transition-colors border border-red-500/30 hover:bg-red-900/20 px-4 py-2 rounded"
            >
                Delete Account
            </button>

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-red-500/50 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-3">Are you absolutely sure?</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            This action cannot be undone. This will permanently delete your account, wipe all your uploaded images, and remove your generated artwork from our servers.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={executeDeletion}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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