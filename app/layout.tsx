import type { Metadata } from 'next';
import { Bentham, Manrope } from 'next/font/google';
import './globals.css';
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';

import Footer from '@/components/layout/Footer';

const bentham = Bentham({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-bentham',
});

const manrope = Manrope({
    weight: ['200', '300', '400', '500', '600', '700', '800'],
    subsets: ['latin'],
    variable: '--font-manrope',
});

export const metadata: Metadata = {
    title: 'HMTI | Landing Page',
    description: 'A modern and sleek landing page for HMTI organization.',
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
            <body className={`${bentham.variable} ${manrope.variable} antialiased`} >
                <SmoothScrollProvider>
                    {children}
                    <Footer />
                </SmoothScrollProvider>
            </body>
        </html>
    );
}
