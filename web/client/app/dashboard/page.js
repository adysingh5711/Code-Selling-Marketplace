// web/client/app/dashboard/page.js
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import * as fcl from "@onflow/fcl";

export default function Dashboard() {
    const [user, setUser] = useState({ loggedIn: false });
    const [userListings, setUserListings] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('listings');

    useEffect(() => {
        fcl.currentUser.subscribe(setUser);
    }, []);

    useEffect(() => {
        if (user.loggedIn && user.addr) {
            fetchUserListings(user.addr);
            fetchUserPurchases(user.addr);
        }
    }, [user]);

    const fetchUserListings = async (address) => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/marketplace/user/${address}`);
            const data = await response.json();
            setUserListings(data);
        } catch (error) {
            console.error('Error fetching user listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPurchases = async (address) => {
        try {
            // In a real app, you would fetch the user's purchases from the blockchain
            // For demo purposes, we'll use mock data
            setPurchases([
                {
                    id: 101,
                    title: "Authentication System",
                    seller: "0x123...789",
                    price: "12.0",
                    purchaseDate: new Date().toISOString(),
                    downloadUrl: "#"
                },
                {
                    id: 102,
                    title: "Data Visualization Library",
                    seller: "0x456...abc",
                    price: "20.0",
                    purchaseDate: new Date(Date.now() - 86400000 * 2).toISOString(),
                    downloadUrl: "#"
                }
            ]);
        } catch (error) {
            console.error('Error fetching purchases:', error);
        }
    };

    if (!user.loggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please connect your wallet</h1>
                    <button
                        onClick={() => fcl.authenticate()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md"
                    >
                        Connect Wallet
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Developer Dashboard</h1>
                        <Link href="/" className="text-indigo-600 hover:text-indigo-800">
                            ← Back to Marketplace
                        </Link>
                    </div>
                    <p className="text-gray-600 mt-2">
                        Manage your code listings and purchases
                    </p>
                </header>

                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('listings')}
                                className={`py-4 px-6 font-medium ${activeTab === 'listings'
                                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                My Listings
                            </button>
                            <button
                                onClick={() => setActiveTab('purchases')}
                                className={`py-4 px-6 font-medium ${activeTab === 'purchases'
                                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                My Purchases
                            </button>
                        </nav>
                    </div>
                </div>

                {activeTab === 'listings' && (
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">Your Code Listings</h2>
                            <Link
                                href="/list"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                            >
                                + List New Code
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <p>Loading your listings...</p>
                            </div>
                        ) : userListings.length > 0 ? (
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price (FLOW)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Listed Date
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {userListings.map((listing) => (
                                            <tr key={listing.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                                                    <div className="text-sm text-gray-500">{listing.description.substring(0, 50)}...</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{listing.price}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(listing.timestamp).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link href={`/listing/${listing.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                                        View
                                                    </Link>
                                                    <button className="text-red-600 hover:text-red-900">
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <Image src="/file.svg" alt="No listings" width={64} height={64} className="mx-auto mb-4" />
                                <h3 className="text-xl font-medium mb-2">No listings yet</h3>
                                <p className="text-gray-600 mb-4">Start selling your code on the marketplace!</p>
                                <Link
                                    href="/list"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md inline-block"
                                >
                                    List Your Code
                                </Link>
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'purchases' && (
                    <section>
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold">Your Purchases</h2>
                        </div>

                        {purchases.length > 0 ? (
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Seller
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price (FLOW)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Purchase Date
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Download
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {purchases.map((purchase) => (
                                            <tr key={purchase.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{purchase.title}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{purchase.seller}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{purchase.price}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(purchase.purchaseDate).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <a
                                                        href={purchase.downloadUrl}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Download
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <Image src="/globe.svg" alt="No purchases" width={64} height={64} className="mx-auto mb-4" />
                                <h3 className="text-xl font-medium mb-2">No purchases yet</h3>
                                <p className="text-gray-600 mb-4">Browse the marketplace to find quality code!</p>
                                <Link
                                    href="/"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md inline-block"
                                >
                                    Browse Marketplace
                                </Link>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}