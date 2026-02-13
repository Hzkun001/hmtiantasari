import { NextRequest, NextResponse } from 'next/server';
import { fetchPublicCalendarEvents } from '@/lib/public-data-server';

const DEFAULT_LIMIT = 300;
const MAX_LIMIT = 500;
const DEFAULT_HISTORY_YEARS = 1;
const DEFAULT_FUTURE_YEARS = 1;

function parseBoundedInt(
    value: string | null,
    fallback: number,
    min: number,
    max: number,
): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    const safeValue = Math.trunc(parsed);
    return Math.min(Math.max(safeValue, min), max);
}

export async function GET(request: NextRequest) {
    const limit = parseBoundedInt(
        request.nextUrl.searchParams.get('limit'),
        DEFAULT_LIMIT,
        1,
        MAX_LIMIT,
    );
    const historyYears = parseBoundedInt(
        request.nextUrl.searchParams.get('historyYears'),
        DEFAULT_HISTORY_YEARS,
        0,
        5,
    );
    const futureYears = parseBoundedInt(
        request.nextUrl.searchParams.get('futureYears'),
        DEFAULT_FUTURE_YEARS,
        0,
        5,
    );

    const now = new Date();
    const startAtIso = new Date(now.getFullYear() - historyYears, 0, 1).toISOString();
    const endAtIso = new Date(now.getFullYear() + futureYears + 1, 0, 1).toISOString();

    const data = await fetchPublicCalendarEvents({
        startAtIso,
        endAtIso,
        limit,
    });

    return NextResponse.json(
        { data },
        {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        },
    );
}
