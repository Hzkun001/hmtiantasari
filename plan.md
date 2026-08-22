# Plan

1. Reuse existing `/berita`, `#section-02`, and `/health` targets to replace dead navigation.
2. Apply semantic/text-only UI fixes in existing components.
3. Reuse `lib/auth.ts` for a small, testable auth-config guard and apply it in `proxy.ts`.
4. Run static checks and focused searches, then verify desktop/mobile UI in the local app.
5. Replace only the certificate checker's explicit square corners with existing panel, control, and pill radius conventions; validate the scoped visual change.
6. Preserve the preferred legacy cabinet frame composition while keeping the admin preview portrait-oriented.
7. Remove KabinetLanding's unused global ScrollTrigger cleanup so route teardown cannot kill newly mounted homepage/footer triggers.

## Risks

- Proxy behavior changes only when required Supabase variables are missing.
- Slider labels are compacted to match the four sections currently rendered.
- Footer privacy link is removed because no route or policy content exists.
- Certificate checker radius changes are isolated to its page stylesheet and do not alter layout or verification behavior.
- Cabinet changes avoid URL heuristics, schema changes, and shared upload utility changes because production image format cannot be inspected locally; the legacy public composition is retained by request.
- KabinetLanding does not own any ScrollTriggers, so removing its global kill has no local trigger-cleanup regression.
