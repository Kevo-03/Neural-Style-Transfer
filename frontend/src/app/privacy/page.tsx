import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-700">
                <h1 className="text-3xl font-extrabold text-white mb-6">Privacy Policy</h1>
                <p className="mb-4 text-sm">Last Updated: March 2026</p>

                <h2 className="text-xl font-bold text-white mt-6 mb-3">1. Information We Collect</h2>
                <p className="mb-4">
                    When you register for an account on NeuralArt, we collect your email address and a securely hashed version of your password. When you use our generation tool, we temporarily process and securely store the images you upload (Content and Style images) and the resulting generated artwork.
                </p>

                <h2 className="text-xl font-bold text-white mt-6 mb-3">2. How We Use Your Data</h2>
                <p className="mb-4">
                    Your data is used strictly to provide the Neural Style Transfer service, authenticate your account, and maintain your personal gallery. <strong>We do not use your personal images or generated artwork to train our AI models.</strong>
                </p>

                <h2 className="text-xl font-bold text-white mt-6 mb-3">3. Data Storage and Security</h2>
                <p className="mb-4">
                    Your data is hosted securely on DigitalOcean servers. Passwords are cryptographically hashed using industry-standard algorithms, and all image uploads are transmitted over encrypted connections (HTTPS). We use secure, HTTP-only cookies to manage your active sessions.
                </p>

                <h2 className="text-xl font-bold text-white mt-6 mb-3">4. Your Rights (KVKK / GDPR)</h2>
                <p className="mb-4">
                    You have the right to access, modify, or delete your personal data at any time. You can permanently delete your generated artwork directly from your Library dashboard. If you wish to completely delete your account and all associated email data from our database, please contact us.
                </p>

                <h2 className="text-xl font-bold text-white mt-6 mb-3">5. Contact</h2>
                <p className="mb-4">
                    If you have any questions about this Privacy Policy, please contact us at: [Your Contact Email]
                </p>
            </div>
        </div>
    );
}