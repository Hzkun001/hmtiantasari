import type { Metadata } from 'next';
import { Bentham, DM_Sans, Lobster, Manrope } from 'next/font/google';
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
                    href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
                    rel="stylesheet"
                    />
                    <link
                    href="https://unpkg.com/boxicons@2.1.4/css/boxicons-solid.min.css"
                    rel="stylesheet"
                    />
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/lenis@1.1.18/dist/lenis.css"
                />
            </head>
            <body className={`${bentham.variable} ${manrope.variable} ${dmSans.variable} ${lobster.variable} antialiased`}>
                <ConditionalSmoothScroll>
                    {children}
                </ConditionalSmoothScroll>
            </body>
        </html>
    );
}
