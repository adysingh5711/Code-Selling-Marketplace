// web/client/app/list/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as fcl from "@onflow/fcl";

export default function ListCodePage() {
    const router = useRouter();
    const [user, setUser] = useState({ loggedIn: false });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        codeHash: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fcl.currentUser.subscribe(setUser);
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('codeFile', file);

        try {
            const response = await fetch('http://localhost:3001/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('File upload failed');
            }

            const data = await response.json();
            setUploadedFile({
                name: file.name,
                size: file.size,
                type: file.type,
                hash: data.codeHash,
            });

            setFormData(prev => ({
                ...prev,
                codeHash: data.codeHash,
            }));
        } catch (error) {
            console.error('Error uploading file:', error);
            setErrors(prev => ({
                ...prev,
                file: 'Failed to upload file. Please try again.',
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Please enter a valid price greater than 0';
        }

        if (!uploadedFile) {
            newErrors.file = 'Please upload your code file';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // In a real implementation, this would trigger a Flow transaction
            // through FCL. For this demo, we'll use our server API.
            const response = await fetch('http://localhost:3001/api/marketplace/list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    codeHash: formData.codeHash,
                    userAddress: user.addr,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to list code');
            }

            const data = await response.json();

            // Success - redirect to dashboard
            router.push('/dashboard');
        } catch (error) {
            console.error('Error listing code:', error);
            setErrors(prev => ({
                ...prev,
                submit: 'Failed to list your code. Please try again.',
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user.loggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please connect your wallet to list code</h1>
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
            <div className="max-w-3xl mx-auto">
                <header className="mb-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">List Your Code</h1>
                        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800">
                            ← Back to Dashboard
                        </Link>
                    </div>
                    <p className="text-gray-600 mt-2">
                        Share your code with developers around the world
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    {errors.submit && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                            {errors.submit}
                        </div>
                    )}

                    <div className="mb-6">
                        <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="E.g., React Component Library"
                        />
                        {errors.title && (
                            <p className="mt-1 text-red-500 text-sm">{errors.title}</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Describe what your code does, features, and any requirements..."
                        ></textarea>
                        {errors.description && (
                            <p className="mt-1 text-red-500 text-sm">{errors.description}</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
                            Price (FLOW)
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            step="0.01"
                            min="0.01"
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.price ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="10.00"
                        />
                        {errors.price && (
                            <p className="mt-1 text-red-500 text-sm">{errors.price}</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label htmlFor="codeFile" className="block text-gray-700 font-medium mb-2">
                            Upload Code (ZIP or Repository)
                        </label>
                        <div className={`border-2 border-dashed rounded-md p-6 text-center ${errors.file ? 'border-red-500' : 'border-gray-300'
                            }`}>
                            {uploadedFile ? (
                                <div>
                                    <div className="text-indigo-600 mb-2">File uploaded successfully!</div>
                                    <div className="text-sm text-gray-500">
                                        <div>Name: {uploadedFile.name}</div>
                                        <div>Size: {(uploadedFile.size / 1024).toFixed(2)} KB</div>
                                        <div className="truncate">Hash: {uploadedFile.hash}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setUploadedFile(null)}
                                        className="mt-3 text-sm text-red-600 hover:text-red-800"
                                    >
                                        Remove file and upload a different one
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <input
                                        type="file"
                                        id="codeFile"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept=".zip,.rar,.7zip,.gz,.tar"
                                    />
                                    <label
                                        htmlFor="codeFile"
                                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                    >
                                        Choose File
                                    </label>
                                    <p className="mt-2 text-sm text-gray-500">
                                        ZIP, RAR, or TAR archives accepted
                                    </p>
                                </div>
                            )}
                        </div>
                        {errors.file && (
                            <p className="mt-1 text-red-500 text-sm">{errors.file}</p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-3 rounded-md text-white ${isSubmitting
                                ? 'bg-indigo-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            {isSubmitting ? 'Listing...' : 'List Code Now'}
                        </button>
                    </div>
                </form>

                <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Listing Guidelines</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        <li>Ensure your code is original or you have the rights to sell it.</li>
                        <li>Include all necessary files and documentation for the buyer.</li>
                        <li>Set a fair price based on complexity and value.</li>
                        <li>Provide a clear description of what your code does and its requirements.</li>
                        <li>Code with security vulnerabilities or malicious intent will be removed.</li>
                    </ul>
                </div>
            </div>
        </main>
    );
}