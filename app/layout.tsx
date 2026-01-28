import type { Metadata } from 'next';
import { Bentham, Roboto } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const bentham = Bentham({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-bentham',
});

const roboto = Roboto({
    weight: ['100', '300', '400', '500', '700', '900'],
    subsets: ['latin'],
    style: ['normal', 'italic'],
    variable: '--font-roboto',
});

export const metadata: Metadata = {
    title: 'MNTN | Landing Page',
    description: 'A modern mountain hiking guide landing page',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/boxicons@latest/css/boxicons.min.css"
                />
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/lenis@1.1.18/dist/lenis.css"
                />
            </head>
            <body className={`${bentham.variable} ${roboto.variable}`}>
                <SmoothScrollProvider>
                    <Header />
                    {children}
                    <Footer />
                </SmoothScrollProvider>

                {/* Optional: YouTube Floating Button */}
                <Script
                    src="https://cdn.jsdelivr.net/gh/YT-PixelPerfectLabs/Youtube-Floating-Button/dist/script.js"
                    strategy="lazyOnload"
                />
            </body>
        </html>
    );
}
