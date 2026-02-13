import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { PostgrestError } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
    },
});

export const NEWS_TABLE_CANDIDATES = ['Activities', 'News'] as const;
export type NewsTableName = (typeof NEWS_TABLE_CANDIDATES)[number];

export interface Activity {
    id: number;
    title: string;
    content: string;
    image_url: string | null;
    date: string;
    category?: string;
    author?: string;
    link?: string;
    created_at?: string;
}

type FetchNewsResult = {
    table: NewsTableName;
    data: Activity[];
};

type FetchNewsOptions = {
    limit?: number;
    columns?: string;
};

/**
 * Fetches news records with table fallback support.
 * Primary table is "Activities"; falls back to "News" for backward compatibility.
 */
export async function fetchNewsRecords(options: FetchNewsOptions = {}): Promise<FetchNewsResult> {
    const { limit, columns = '*' } = options;
    let firstSuccessful: FetchNewsResult | null = null;
    let lastError: PostgrestError | null = null;

    for (const table of NEWS_TABLE_CANDIDATES) {
        let query = supabase
            .from(table)
            .select(columns)
            .order('date', { ascending: false });
        if (typeof limit === 'number') {
            query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
            lastError = error;
            continue;
        }

        const rows = (data || []) as Activity[];

        if (rows.length > 0) {
            return { table, data: rows };
        }

        if (!firstSuccessful) {
            firstSuccessful = { table, data: rows };
        }
    }

    if (firstSuccessful) return firstSuccessful;
    if (lastError) throw lastError;

    throw new Error('No available news table found');
}

export interface CalendarEvent {
    id: number;
    title: string;
    start_at: string;
    organizer_department: string;
    created_at?: string;
    updated_at?: string;
}

export interface TeamMember {
    id: number;
    name: string;
    role: string;
    department?: string;
    bio?: string;
    image_url?: string;
    linkedin?: string;
    instagram?: string;
    created_at: string;
}

export interface SiteSettings {
    id: number;
    site_name: string;
    site_tagline?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    facebook_url?: string;
    twitter_url?: string;
    instagram_url?: string;
    linkedin_url?: string;
    youtube_url?: string;
    about_text?: string;
    updated_at: string;
}

export interface Certificate {
    id: number;
    code: string;
    issued_at?: string | null;
    created_at?: string;
}
