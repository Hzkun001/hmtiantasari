import { NextRequest, NextResponse } from 'next/server';

const NEWS_SELECT = 'id,title,content,body,image_url,date,category,author,slug,meta_title,meta_description,images,created_at';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const url = new URL('/rest/v1/News', supabaseUrl);
    url.searchParams.set('select', NEWS_SELECT);
    url.searchParams.set('slug', `eq.${slug}`);
    url.searchParams.set('limit', '1');

    const response = await fetch(url.toString(), {
        headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 300 },
    });

    if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }

    const data = await response.json();

    if (!data || data.length === 0) {
        return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    return NextResponse.json({ data: data[0] });
}
