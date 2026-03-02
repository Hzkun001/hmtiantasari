export type HealthState = 'operational' | 'degraded' | 'down';

export type HealthCheck = {
    id: string;
    name: string;
    state: HealthState;
    detail: string;
    latencyMs?: number;
};

export type HealthPayload = {
    overallState: HealthState;
    statusText: string;
    checkedAt: string;
    uptimeSeconds: number;
    environment: {
        runtime: 'nodejs';
        region: string | null;
        deployment: string | null;
    };
    checks: HealthCheck[];
};

const CACHE_CONTROL_HEADER = 'no-store, no-cache, max-age=0, must-revalidate';

const STATE_SCORE: Record<HealthState, number> = {
    operational: 0,
    degraded: 1,
    down: 2,
};

function stateToText(state: HealthState): string {
    if (state === 'operational') return 'All systems operational';
    if (state === 'degraded') return 'Partially degraded';
    return 'Major outage';
}

function summarizeState(states: HealthState[]): HealthState {
    if (states.length === 0) return 'operational';

    let worst: HealthState = 'operational';
    for (const state of states) {
        if (STATE_SCORE[state] > STATE_SCORE[worst]) worst = state;
    }
    return worst;
}

async function fetchWithTimeout(
    input: string | URL,
    init: RequestInit,
    timeoutMs: number,
) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(input, {
            ...init,
            signal: controller.signal,
            cache: 'no-store',
        });
    } finally {
        clearTimeout(timeout);
    }
}

async function checkSupabase(): Promise<HealthCheck> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return {
            id: 'supabase',
            name: 'Supabase',
            state: 'degraded',
            detail: 'Konfigurasi Supabase belum lengkap.',
        };
    }

    const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/`;
    const startedAt = Date.now();

    try {
        const response = await fetchWithTimeout(
            endpoint,
            {
                method: 'HEAD',
                headers: {
                    apikey: supabaseAnonKey,
                    Authorization: `Bearer ${supabaseAnonKey}`,
                },
            },
            3500,
        );

        const latencyMs = Date.now() - startedAt;

        if (response.status < 500) {
            return {
                id: 'supabase',
                name: 'Supabase',
                state: 'operational',
                detail: 'Database endpoint dapat dijangkau.',
                latencyMs,
            };
        }

        return {
            id: 'supabase',
            name: 'Supabase',
            state: 'down',
            detail: `Supabase merespons status ${response.status}.`,
            latencyMs,
        };
    } catch {
        return {
            id: 'supabase',
            name: 'Supabase',
            state: 'down',
            detail: 'Tidak dapat menghubungi endpoint Supabase.',
        };
    }
}

function checkGemini(): HealthCheck {
    if (process.env.GEMINI_API_KEY) {
        return {
            id: 'gemini',
            name: 'Gemini API',
            state: 'operational',
            detail: 'API key tersedia.',
        };
    }

    return {
        id: 'gemini',
        name: 'Gemini API',
        state: 'degraded',
        detail: 'GEMINI_API_KEY belum diset.',
    };
}

function checkWebService(): HealthCheck {
    return {
        id: 'web',
        name: 'Web Service',
        state: 'operational',
        detail: 'Route handler merespons normal.',
    };
}

export async function buildHealthPayload(): Promise<HealthPayload> {
    const checks = [checkWebService(), await checkSupabase(), checkGemini()];
    const overallState = summarizeState(checks.map((item) => item.state));

    return {
        overallState,
        statusText: stateToText(overallState),
        checkedAt: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        environment: {
            runtime: 'nodejs',
            region: process.env.VERCEL_REGION ?? null,
            deployment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? null,
        },
        checks,
    };
}

export function buildHealthFallbackPayload(detail: string): HealthPayload {
    return {
        overallState: 'down',
        statusText: stateToText('down'),
        checkedAt: new Date().toISOString(),
        uptimeSeconds:
            typeof process !== 'undefined' && typeof process.uptime === 'function'
                ? Math.floor(process.uptime())
                : 0,
        environment: {
            runtime: 'nodejs',
            region:
                typeof process !== 'undefined' ? process.env.VERCEL_REGION ?? null : null,
            deployment:
                typeof process !== 'undefined'
                    ? process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? null
                    : null,
        },
        checks: [
            {
                id: 'health-handler',
                name: 'Health Handler',
                state: 'down',
                detail,
            },
        ],
    };
}

export function healthCacheControlHeader() {
    return CACHE_CONTROL_HEADER;
}
