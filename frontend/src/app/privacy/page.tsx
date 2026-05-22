import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 px-4 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl w-full">
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold text-indigo-400 inline-block">
                        Privacy Policy
                    </h1>
                    <p className="text-sm text-gray-500 mt-2">Last Updated: April 2026</p>
                </div>

                <div className="space-y-8 text-base">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-2">1. Information We Collect</h2>
                        <p className="leading-relaxed">
                            When you register for an account on NeuralArt, we collect your username and a securely hashed version of your password. When you use our generation tool, we temporarily process and securely store the images you upload (Content and Style images) and the resulting generated artwork.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-2">2. How We Use Your Data</h2>
                        <p className="leading-relaxed">
                            Your data is used strictly to provide the Neural Style Transfer service, authenticate your account, and maintain your personal gallery.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-2">3. Data Storage and Security</h2>
                        <p className="leading-relaxed">
                            Your data is hosted securely on DigitalOcean servers. Passwords are cryptographically hashed using industry-standard algorithms, and all image uploads are transmitted over encrypted connections (HTTPS). We use secure, HTTP-only cookies to manage your active sessions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-2">4. Your Rights (KVKK / GDPR)</h2>
                        <p className="leading-relaxed">
                            You have the right to access, modify, or delete your personal data at any time. You can permanently delete your generated artwork directly from your Library dashboard or completely delete your account and all associated data from our database using the Delete Account button in your Library.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-2">5. Contact</h2>
                        <p className="leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:neuralart.privacy@gmail.com" className="font-bold text-indigo-400 hover:opacity-80 transition underline decoration-indigo-400/30">neuralart.privacy@gmail.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}