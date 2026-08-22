export function isAdmin(appMetadata: Record<string, unknown> | null | undefined): boolean {
    return appMetadata?.role === 'admin';
}

export function getSupabaseAuthConfig(
    supabaseUrl: string | undefined,
    supabaseAnonKey: string | undefined,
) {
    if (!supabaseUrl?.trim() || !supabaseAnonKey?.trim()) return null;
    return { supabaseUrl, supabaseAnonKey };
}
