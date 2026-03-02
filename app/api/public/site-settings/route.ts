import { NextResponse } from 'next/server';
import { fetchPublicSiteSettings } from '@/lib/public-data-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    const data = await fetchPublicSiteSettings();

    return NextResponse.json(
        { data },
        {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        },
    );
}
