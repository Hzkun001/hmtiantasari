import 'server-only';

export type SiteSettingsServerData = {
    site_name?: string | null;
    site_tagline?: string | null;
    about_text?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    address?: string | null;
    facebook_url?: string | null;
    twitter_url?: string | null;
    instagram_url?: string | null;
    linkedin_url?: string | null;
    youtube_url?: string | null;
};

const SETTINGS_SELECT = [
    'site_name',
    'site_tagline',
    'about_text',
    'contact_email',
    'contact_phone',
    'address',
    'facebook_url',
    'twitter_url',
    'instagram_url',
    'linkedin_url',
    'youtube_url',
].join(',');

export async function getSiteSettingsServer(): Promise<SiteSettingsServerData | null> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return null;
    }

    try {
        const url = new URL('/rest/v1/SiteSettings', supabaseUrl);
        url.searchParams.set('select', SETTINGS_SELECT);
        url.searchParams.set('order', 'updated_at.desc.nullslast,id.desc');
        url.searchParams.set('limit', '1');

        const response = await fetch(url.toString(), {
            headers: {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
            },
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            return null;
        }

        const rows = (await response.json()) as SiteSettingsServerData[];
        if (!Array.isArray(rows) || rows.length === 0) {
            return null;
        }

        return rows[0];
    } catch (error) {
        console.error('Failed to fetch site settings on server:', error);
        return null;
    }
}
