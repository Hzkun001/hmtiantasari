import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
