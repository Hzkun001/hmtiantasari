export function isAdmin(appMetadata: Record<string, unknown> | null | undefined): boolean {
    return appMetadata?.role === 'admin';
}