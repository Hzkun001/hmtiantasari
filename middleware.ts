import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return res;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return req.cookies.getAll().map((cookie) => ({
                    name: cookie.name,
                    value: cookie.value,
                }));
            },
            setAll(cookies) {
                cookies.forEach(({ name, value, options }) => {
                    res.cookies.set(name, value, options);
                });
            },
        },
    });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith('/admin') && !session) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if (pathname === '/login' && session) {
        return NextResponse.redirect(new URL('/admin', req.url));
    }

    return res;
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};
