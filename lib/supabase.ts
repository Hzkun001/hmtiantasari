import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Debug: Log configuration (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('Supabase Config:', {
        url: supabaseUrl || 'MISSING',
        keyPresent: !!supabaseAnonKey,
    });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
});

export interface Project {
    id: number;
    title: string;
    description: string;
    image_url: string | null;
    tech_stack?: string[];
    demo_link?: string | null;
    repo_url?: string | null;
    author?: string;
    size?: 'large' | 'medium' | 'small';
}

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
