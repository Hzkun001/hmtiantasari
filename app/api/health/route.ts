import { NextResponse } from 'next/server';
import {
    buildHealthFallbackPayload,
    buildHealthPayload,
    healthCacheControlHeader,
} from '@/lib/health';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function statusCodeFromState(state: 'operational' | 'degraded' | 'down') {
    if (state === 'down') return 503;
    return 200;
}

export async function GET() {
    try {
        const payload = await buildHealthPayload();
        const status = statusCodeFromState(payload.overallState);

        return NextResponse.json(payload, {
            status,
            headers: {
                'Cache-Control': healthCacheControlHeader(),
            },
        });
    } catch {
        const payload = buildHealthFallbackPayload(
            'Unexpected error while collecting health checks.',
        );

        return NextResponse.json(payload, {
            status: 503,
            headers: {
                'Cache-Control': healthCacheControlHeader(),
            },
        });
    }
}

export async function HEAD() {
    try {
        const payload = await buildHealthPayload();
        const status = statusCodeFromState(payload.overallState);

        return new Response(null, {
            status,
            headers: {
                'Cache-Control': healthCacheControlHeader(),
            },
        });
    } catch {
        return new Response(null, {
            status: 503,
            headers: {
                'Cache-Control': healthCacheControlHeader(),
            },
        });
    }
}
