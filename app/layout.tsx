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
    metadataBase: new URL('https://hmtinantasari.com'),
    title: {
        default: 'HMTI UIN Antasari',
        template: '%s | HMTI UIN Antasari'
    },
    description: 'Website Resmi Himpunan Mahasiswa Teknologi Informasi (HMTI) UIN Antasari Banjarmasin. Kabinet Arnanta - Wadah aspirasi, kreasi, dan inovasi mahasiswa TI.',
    keywords: ['HMTI', 'UIN Antasari', 'Teknologi Informasi', 'Himpunan Mahasiswa', 'Kabinet Arnanta', 'Mahasiswa IT', 'Banjarmasin', 'Organisasi Kampus'],
    authors: [{ name: 'HMTI UIN Antasari' }, { name: 'Divisi Ristek' }],
    creator: 'HMTI UIN Antasari',
    publisher: 'HMTI UIN Antasari',
    icons: {
        icon: '/images/kabinet.svg',
        apple: '/images/kabinet.svg',
    },
    openGraph: {
        type: 'website',
        locale: 'id_ID',
        url: 'https://hmtinantasari.com',
        title: 'HMTI UIN Antasari - Kabinet Arnanta',
        description: 'Mewujudkan mahasiswa Teknologi Informasi yang berintegritas, kreatif, dan inovatif bersama HMTI UIN Antasari.',
        siteName: 'HMTI UIN Antasari',
        images: [
            {
                url: '/kabinet.png', // Fallback to a png if available (saw it in header) or use svg
                width: 1200,
                height: 630,
                alt: 'Logo HMTI Kabinet Arnanta',
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'HMTI UIN Antasari',
        description: 'Official Website Himpunan Mahasiswa Teknologi Informasi UIN Antasari Banjarmasin.',
        images: ['/kabinet.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id">
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
