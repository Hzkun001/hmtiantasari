import type { Metadata } from 'next';
import { Bentham, DM_Sans, Lobster, Manrope } from 'next/font/google';
import 'lenis/dist/lenis.css';
import './globals.css';
import ConditionalSmoothScroll from '@/components/providers/ConditionalSmoothScroll';
import { getSiteSettingsServer } from '@/lib/site-settings-server';

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

const DEFAULT_SITE_URL = 'https://hmtinantasari.com';
const DEFAULT_SITE_NAME = 'HMTI UIN Antasari';
const DEFAULT_DESCRIPTION = 'Website Resmi Himpunan Mahasiswa Teknologi Informasi (HMTI) UIN Antasari Banjarmasin. Kabinet Arnanta - Wadah aspirasi, kreasi, dan inovasi mahasiswa TI.';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettingsServer();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
    const siteName = settings?.site_name?.trim() || DEFAULT_SITE_NAME;
    const siteTagline = settings?.site_tagline?.trim();
    const description = settings?.about_text?.trim() || DEFAULT_DESCRIPTION;
    const defaultTitle = siteTagline ? `${siteName} - ${siteTagline}` : siteName;
    let metadataBase = new URL(DEFAULT_SITE_URL);

    try {
        metadataBase = new URL(siteUrl);
    } catch {
        metadataBase = new URL(DEFAULT_SITE_URL);
    }

    return {
        metadataBase,
        title: {
            default: defaultTitle,
            template: `%s | ${siteName}`,
        },
        description,
        keywords: ['HMTI', 'UIN Antasari', 'Teknologi Informasi', 'Himpunan Mahasiswa', 'Kabinet Arnanta', 'Mahasiswa IT', 'Banjarmasin', 'Organisasi Kampus'],
        authors: [{ name: siteName }, { name: 'Divisi Ristek' }],
        creator: siteName,
        publisher: siteName,
        icons: {
            icon: '/images/kabinet.svg',
            apple: '/images/kabinet.svg',
        },
        openGraph: {
            type: 'website',
            locale: 'id_ID',
            url: siteUrl,
            title: defaultTitle,
            description,
            siteName,
            images: [
                {
                    url: '/kabinet.png',
                    width: 1200,
                    height: 630,
                    alt: `Logo ${siteName}`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: siteName,
            description,
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
}

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
