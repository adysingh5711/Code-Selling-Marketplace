// web/client/app/listing/[id]/page.js
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import * as fcl from "@onflow/fcl";

export default function ListingDetailPage({ params }) {
    const { id } = params;
    const [user, setUser] = useState({ loggedIn: false });
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [purchaseStatus, setPurchaseStatus] = useState(null);

    useEffect(() => {
        fcl.currentUser.subscribe(setUser);
        fetchListing(id);
    }, [id]);

    const fetchListing = async (listingId) => {
        try {
            setLoading(true);
            // In a real app, this would fetch from the blockchain
            // For demo, we'll simulate with some mock data

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 800));

            setListing({
                id: listingId,
                title: "React Component Library with Tailwind CSS",
                description: "A comprehensive library of 50+ React components styled with Tailwind CSS. Includes buttons, cards, forms, modals, navigation, and more. All components are fully responsive and customizable. Perfect for rapid prototyping and production applications.",
                price: "25.0",
                owner: "0x9d2ade18cb6bea1a",
                codeHash: "8f7d88e5c9cd45a3a42f172d52b33c5e",
                timestamp: Date.now() - 86400000 * 3,
                language: "JavaScript",
                fileSize: "2.4 MB",
                totalFiles: 87,
                features: [
                    "50+ React components",
                    "Fully styled with Tailwind CSS",
                    "Responsive design",
                    "Accessibility compliant",
                    "Dark mode support",
                    "Typescript definitions"
                ]
            });
        } catch (error) {
            console.error('Error fetching listing:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        if (!user.loggedIn) {
            fcl.authenticate();
            return;
        }

        try {
            setPurchasing(true);
            setPurchaseStatus('processing');

            // In a real app, this would trigger a Flow transaction through FCL
            const response = await fetch('http://localhost:3001/api/marketplace/buy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    listingId: listing.id,
                    buyerAddress: user.addr,
                }),
            });

            if (!response.ok) {
                throw new Error('Purchase failed');
            }

            const data = await response.json();

            // Success
            setPurchaseStatus('success');

            // In a real app, you'd redirect to download page or show download link
            setTimeout(() => {
                window.location.href = data.downloadUrl;
            }, 2000);
        } catch (error) {
            console.error('Error purchasing code:', error);
            setPurchaseStatus('error');
        } finally {
            setTimeout(() => {
                setPurchasing(false);
                setPurchaseStatus(null);
            }, 3000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading listing details...</p>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
                    <Link href="/" className="text-indigo-600 hover:text-indigo-800">
                        Back to Marketplace
                    </Link>
                </div>
            </div>
        );
    }

    const isOwner = user.loggedIn && user.addr === listing.owner;

    return (
        <main className="min-h-screen p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <Link href="/" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
                        ← Back to Marketplace
                    </Link>
                    <h1 className="text-3xl font-bold">{listing.title}</h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-4">Description</h2>
                            <p className="text-gray-700 mb-6">{listing.description}</p>

                            <h2 className="text-xl font-semibold mb-4">Features</h2>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-6">
                                {listing.features.map((feature, index) => (
                                    <li key={index}>{feature}</li>
                                ))}
                            </ul>

                            <div className="border-t pt-6">
                                <h2 className="text-xl font-semibold mb-4">Technical Details</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-gray-500">Language:</span>
                                        <span className="ml-2 text-gray-700">{listing.language}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">File Size:</span>
                                        <span className="ml-2 text-gray-700">{listing.fileSize}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Total Files:</span>
                                        <span className="ml-2 text-gray-700">{listing.totalFiles}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Listed:</span>
                                        <span className="ml-2 text-gray-700">
                                            {new Date(listing.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 sticky top-6">
                            <div className="mb-6">
                                <div className="text-3xl font-bold text-indigo-600 mb-2">
                                    {listing.price} FLOW
                                </div>
                                <div className="text-sm text-gray-500">
                                    Secure one-time payment
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Instant delivery after purchase</span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Full source code access</span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Blockchain verified transaction</span>
                                </div>
                            </div>

                            {isOwner ? (
                                <div className="bg-gray-100 rounded-md p-4 text-center">
                                    <p className="text-gray-700">This is your listing</p>
                                    <Link
                                        href="/dashboard"
                                        className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
                                    >
                                        Manage in Dashboard
                                    </Link>
                                </div>
                            ) : (
                                <button
                                    onClick={handlePurchase}
                                    disabled={purchasing}
                                    className={`w-full py-3 rounded-md text-white text-lg font-medium ${purchasing
                                        ? 'bg-indigo-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                        }`}
                                >
                                    {purchasing ? (
                                        purchaseStatus === 'processing' ? 'Processing...' :
                                            purchaseStatus === 'success' ? 'Success! Redirecting...' :
                                                purchaseStatus === 'error' ? 'Failed. Try again' :
                                                    'Processing...'
                                    ) : (
                                        'Buy Now'
                                    )}
                                </button>
                            )}

                            <div className="mt-6 text-center text-sm text-gray-500">
                                <div className="flex items-center justify-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    Secure payment via Flow blockchain
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="font-medium mb-3">Seller Information</h3>
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-indigo-600 font-medium">
                                        {listing.owner.slice(0, 2)}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-sm font-medium">
                                        {`${listing.owner.slice(0, 6)}...${listing.owner.slice(-4)}`}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        4 listings available
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}