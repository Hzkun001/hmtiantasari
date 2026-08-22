import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { isAdmin } from '@/lib/auth';

type RevalidateRequest = {
    slug?: string;
};

const PUBLIC_NEWS_PATHS = [
    '/berita',
    '/api/public/news',
];

const PUBLIC_NEWS_TAGS = ['news'];

export async function POST(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: () => {},
            },
        });
        const { data: { user } } = await supabase.auth.getUser();
        if (!isAdmin(user?.app_metadata)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = (await request.json()) as RevalidateRequest;

        const revalidated: { paths: string[], tags: string[] } = {
            paths: [],
            tags: [],
        };

        // Revalidate by slug (revalidates the detail page)
        if (body.slug && typeof body.slug === 'string') {
            const detailPath = `/berita/${encodeURIComponent(body.slug)}`;
            revalidatePath(detailPath);
            revalidated.paths.push(detailPath);
        }

        // Always revalidate public news pages and API
        for (const path of PUBLIC_NEWS_PATHS) {
            revalidatePath(path);
            if (!revalidated.paths.includes(path)) {
                revalidated.paths.push(path);
            }
        }

        // Always revalidate news tags
        for (const tag of PUBLIC_NEWS_TAGS) {
            revalidateTag(tag, { expire: 0 });
            if (!revalidated.tags.includes(tag)) {
                revalidated.tags.push(tag);
            }
        }

        return NextResponse.json({
            revalidated: true,
            ...revalidated,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('[revalidate] Error:', error);
        return NextResponse.json(
            { error: 'Failed to revalidate' },
            { status: 500 }
        );
    }
}
