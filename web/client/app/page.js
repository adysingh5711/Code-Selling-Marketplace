// web/client/app/page.js
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import * as fcl from "@onflow/fcl";

// Configure FCL for Flow blockchain interaction
fcl.config()
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
  .put("app.detail.title", "Code Marketplace")
  .put("app.detail.icon", "https://placekitten.com/g/200/200")
  .put("0x9d2ade18cb6bea1a", "0x9d2ade18cb6bea1a");

export default function Home() {
  const [user, setUser] = useState({ loggedIn: false });
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to user authentication changes
    fcl.currentUser.subscribe(setUser);

    // Fetch listings
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/listings');
      const data = await response.json();
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    fcl.authenticate();
  };

  const handleLogout = () => {
    fcl.unauthenticate();
  };

  return (
    <main className="min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold">Code Marketplace</h1>
          <div className="flex items-center gap-4">
            {user.loggedIn ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800">
                  Dashboard
                </Link>
                <span className="text-gray-700 truncate max-w-[200px]">
                  {user.addr}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </header>

        <section className="mb-12">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white">
            <h2 className="text-4xl font-bold mb-4">Buy and Sell Code Securely</h2>
            <p className="text-xl mb-6">
              A blockchain-powered marketplace for developers to monetize their code and discover quality solutions.
            </p>
            <div className="flex gap-4">
              <Link
                href="/list"
                className="bg-white text-indigo-600 hover:bg-gray-100 px-6 py-3 rounded-md font-medium"
              >
                List Your Code
              </Link>
              <Link
                href="#listings"
                className="bg-transparent border border-white text-white hover:bg-white hover:text-indigo-600 px-6 py-3 rounded-md font-medium"
              >
                Browse Listings
              </Link>
            </div>
          </div>
        </section>

        <section id="listings" className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Listings</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <p>Loading listings...</p>
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div key={listing.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{listing.title}</h3>
                    <p className="text-gray-600 mb-4">{listing.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-600 font-bold">{listing.price} FLOW</span>
                      <Link
                        href={`/listing/${listing.id}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Image src="/file.svg" alt="No listings" width={64} height={64} className="mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No listings yet</h3>
              <p className="text-gray-600 mb-4">Be the first to list your code on the marketplace!</p>
              <Link
                href="/list"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md inline-block"
              >
                List Your Code
              </Link>
            </div>
          )}
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-indigo-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                <span className="text-indigo-600 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-medium mb-2">List Your Code</h3>
              <p className="text-gray-600">
                Upload your code, set a price, and provide a description of what your code does.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-indigo-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                <span className="text-indigo-600 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-medium mb-2">Secure Transaction</h3>
              <p className="text-gray-600">
                Buyers purchase your code through secure blockchain transactions with FLOW tokens.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-indigo-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                <span className="text-indigo-600 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-medium mb-2">Instant Delivery</h3>
              <p className="text-gray-600">
                After purchase, buyers instantly receive access to download the code files.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}