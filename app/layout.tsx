import type { Metadata } from 'next';
import './globals.css';
import ConditionalSmoothScroll from '@/components/providers/ConditionalSmoothScroll';

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
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Bentham&family=Manrope:wght@200..800&family=DM+Sans:wght@100..1000&display=swap"
                />
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
            <body className="antialiased">
                <ConditionalSmoothScroll>
                    {children}
                </ConditionalSmoothScroll>
            </body>
        </html>
    );
}
