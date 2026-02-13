import 'server-only';

import type { Activity, CalendarEvent } from '@/lib/supabase';
import { getSiteSettingsServer, type SiteSettingsServerData } from '@/lib/site-settings-server';

const NEWS_TABLE_CANDIDATES = ['Activities', 'News'] as const;
type NewsTableName = (typeof NEWS_TABLE_CANDIDATES)[number];

const NEWS_SELECT = 'id,title,content,image_url,date,category,author,link';
const CALENDAR_SELECT = 'id,title,start_at,organizer_department';

type FetchPublicNewsOptions = {
    limit?: number;
};

type PublicNewsResult = {
    table: NewsTableName;
    data: Activity[];
};

type FetchPublicCalendarOptions = {
    startAtIso: string;
    endAtIso: string;
    limit?: number;
};

function getSupabasePublicConfig() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return null;

    return { supabaseUrl, supabaseAnonKey };
}

function createRestHeaders(apiKey: string): HeadersInit {
    return {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    };
}

export async function fetchPublicNews(
    options: FetchPublicNewsOptions = {},
): Promise<PublicNewsResult | null> {
    const config = getSupabasePublicConfig();
    if (!config) return null;

    const { supabaseUrl, supabaseAnonKey } = config;
    const limit = options.limit ?? 20;

    let firstSuccessful: PublicNewsResult | null = null;

    for (const table of NEWS_TABLE_CANDIDATES) {
        const url = new URL(`/rest/v1/${table}`, supabaseUrl);
        url.searchParams.set('select', NEWS_SELECT);
        url.searchParams.set('order', 'date.desc.nullslast,id.desc');
        url.searchParams.set('limit', String(limit));

        try {
            const response = await fetch(url.toString(), {
                headers: createRestHeaders(supabaseAnonKey),
                next: { revalidate: 300 },
            });

            if (!response.ok) continue;

            const rows = (await response.json()) as Activity[];
            if (rows.length > 0) {
                return { table, data: rows };
            }

            if (!firstSuccessful) {
                firstSuccessful = { table, data: rows };
            }
        } catch {
            continue;
        }
    }

    return firstSuccessful;
}

export async function fetchPublicCalendarEvents(
    options: FetchPublicCalendarOptions,
): Promise<CalendarEvent[]> {
    const config = getSupabasePublicConfig();
    if (!config) return [];

    const { supabaseUrl, supabaseAnonKey } = config;
    const { startAtIso, endAtIso, limit = 300 } = options;

    const url = new URL('/rest/v1/CalendarEvents', supabaseUrl);
    url.searchParams.set('select', CALENDAR_SELECT);
    url.searchParams.set('and', `(start_at.gte.${startAtIso},start_at.lt.${endAtIso})`);
    url.searchParams.set('order', 'start_at.asc');
    url.searchParams.set('limit', String(limit));

    const response = await fetch(url.toString(), {
        headers: createRestHeaders(supabaseAnonKey),
        next: { revalidate: 300 },
    });

    if (!response.ok) return [];

    const rows = (await response.json()) as CalendarEvent[];
    return Array.isArray(rows) ? rows : [];
}

export async function fetchPublicSiteSettings(): Promise<SiteSettingsServerData | null> {
    return getSiteSettingsServer();
}
