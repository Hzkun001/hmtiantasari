import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function proxy(req: NextRequest) {
    let res = NextResponse.next({ request: req });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return res;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll: () => req.cookies.getAll(),
            setAll(cookies) {
                cookies.forEach(({ name, value }) => req.cookies.set(name, value));
                res = NextResponse.next({ request: req });
                cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
            },
        },
    });

    const { data: { user } } = await supabase.auth.getUser();
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith('/admin') && !user) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if (pathname === '/login' && user) {
        return NextResponse.redirect(new URL('/admin', req.url));
    }

    return res;
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};
