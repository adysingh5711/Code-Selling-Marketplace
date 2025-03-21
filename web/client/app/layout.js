import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import { AppProvider } from '@/context/AppContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Code Marketplace',
  description: 'A decentralized marketplace for buying and selling code',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <Navigation />
          <main>{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}