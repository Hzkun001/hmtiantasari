import { NextRequest, NextResponse } from 'next/server';
import { fetchPublicNews } from '@/lib/public-data-server';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
    const limitParam = request.nextUrl.searchParams.get('limit');
    const parsedLimit = Number(limitParam);
    const limit = Number.isFinite(parsedLimit)
        ? Math.min(Math.max(Math.trunc(parsedLimit), 1), MAX_LIMIT)
        : DEFAULT_LIMIT;

    const result = await fetchPublicNews({ limit });
    const payload = {
        table: result?.table ?? null,
        data: result?.data ?? [],
    };

    return NextResponse.json(payload, {
        headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
    });
}
