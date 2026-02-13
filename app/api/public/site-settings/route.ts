import { NextResponse } from 'next/server';
import { fetchPublicSiteSettings } from '@/lib/public-data-server';

export async function GET() {
    const data = await fetchPublicSiteSettings();

    return NextResponse.json(
        { data },
        {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        },
    );
}
