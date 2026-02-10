import type { Metadata } from 'next';
import { Bentham, DM_Sans, Lobster, Manrope } from 'next/font/google';
import 'lenis/dist/lenis.css';
import './globals.css';
import ConditionalSmoothScroll from '@/components/providers/ConditionalSmoothScroll';

const bentham = Bentham({
    weight: '400',
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-bentham',
});

const manrope = Manrope({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-manrope',
});

const dmSans = DM_Sans({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-dm-sans',
});

const lobster = Lobster({
    weight: '400',
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-lobster',
});

export const metadata: Metadata = {
    title: 'HMTI',
    description: 'Himpunan Mahasiswa Teknologi Informasi UIN Antasari',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
            </head>
            <body className={`${bentham.variable} ${manrope.variable} ${dmSans.variable} ${lobster.variable} antialiased`}>
                <ConditionalSmoothScroll>
                    {children}
                </ConditionalSmoothScroll>
            </body>
        </html>
    );
}
