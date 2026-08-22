import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing-anon-key';

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
    },
});

export interface Activity {
    id: number;
    title: string;
    content: string;
    image_url: string | null;
    date: string;
    category?: string;
    author?: string;
    link?: string;
    slug?: string;
    body?: Record<string, unknown> | null;
    meta_title?: string;
    meta_description?: string;
    images?: string[];
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

export interface NewsItem {
    id: number;
    title: string;
    content: string;
    body: Record<string, unknown> | null;
    image_url: string | null;
    date: string;
    category?: string;
    author?: string;
    link?: string;
    slug?: string;
    meta_title?: string;
    meta_description?: string;
    images?: string[];
    created_at?: string;
    updated_at?: string;
}

export async function fetchNewsRecords(): Promise<Activity[]> {
    const { data, error } = await supabase
        .from('News')
        .select('*')
        .order('date', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Activity[];
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
