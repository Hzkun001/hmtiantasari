const requests = new Map<string, { count: number; resetAt: number }>();

// ponytail: per-instance limiter handles bursts; move to Vercel Firewall/KV if distributed limits are needed.
export function allowRequest(key: string, limit = 10, windowMs = 60_000, now = Date.now()): boolean {
    const current = requests.get(key);
    if (!current || current.resetAt <= now) {
        requests.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }
    if (current.count >= limit) return false;
    current.count += 1;
    return true;
}
