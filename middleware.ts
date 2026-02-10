import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    // For now, we'll skip middleware protection since Supabase handles auth client-side
    // This allows the redirect to work properly
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};
