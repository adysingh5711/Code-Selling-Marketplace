import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Code Marketplace',
  description: 'Buy and sell code securely on the Flow blockchain',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-white shadow-sm">
          <div className="container mx-auto flex justify-between items-center p-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/globe.svg"
                alt="Code Marketplace Logo"
                width={32}
                height={32}
              />
              <span className="text-xl font-bold">Code Marketplace</span>
            </Link>
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link href="/" className="text-gray-700 hover:text-blue-500">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-700 hover:text-blue-500">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/list" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full">
                    List Code
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="bg-gray-100 mt-12">
          <div className="container mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <Link href="/" className="flex items-center space-x-2">
                  <Image
                    src="/globe.svg"
                    alt="Code Marketplace Logo"
                    width={24}
                    height={24}
                  />
                  <span className="text-lg font-bold">Code Marketplace</span>
                </Link>
                <p className="text-sm text-gray-600 mt-2">
                  Buy and sell code securely on the Flow blockchain
                </p>
              </div>
              <div className="flex space-x-6">
                <Link href="/about" className="text-gray-600 hover:text-gray-900">
                  About
                </Link>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900">
                  Terms
                </Link>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
                  Privacy
                </Link>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-6 pt-6 text-center text-sm text-gray-600">
              © {new Date().getFullYear()} Code Marketplace. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}