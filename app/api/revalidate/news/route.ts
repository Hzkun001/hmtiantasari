import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

// Secret token untuk keamanan (bisa dipindah ke env)
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET ?? 'hmti-admin-secret';

type RevalidateRequest = {
    secret?: string;
    paths?: string[];
    tags?: string[];
    slug?: string;
};

const PUBLIC_NEWS_PATHS = [
    '/berita',
    '/api/public/news',
];

const PUBLIC_NEWS_TAGS = ['news'];

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as RevalidateRequest;

        // Basic security check
        if (body.secret && body.secret !== REVALIDATE_SECRET) {
            return NextResponse.json(
                { error: 'Invalid secret' },
                { status: 401 }
            );
        }

        const revalidated: { paths: string[], tags: string[] } = {
            paths: [],
            tags: [],
        };

        // Revalidate specific paths if provided
        if (body.paths && Array.isArray(body.paths)) {
            for (const path of body.paths) {
                if (typeof path === 'string') {
                    revalidatePath(path);
                    revalidated.paths.push(path);
                }
            }
        }

        // Revalidate by slug (revalidates the detail page)
        if (body.slug && typeof body.slug === 'string') {
            const detailPath = `/berita/${body.slug}`;
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
            revalidateTag(tag);
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