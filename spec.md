# Spec

## Goal

Fix verified navigation, accessibility, wording, image, footer, and admin-auth issues without changing data contracts or adding dependencies.

## Requirements

- Homepage navigation targets only existing sections/routes; footer exposes no nonexistent route.
- Mobile homepage has a level-one heading; news search has an accessible label.
- Public news empty/loading/error copy consistently uses “berita”.
- Missing Supabase auth configuration blocks `/admin` and `/login` by redirecting to the existing `/health` page.
- Chatbot avatar preserves its aspect ratio; mobile footer secondary text is readable.
- Certificate checker uses the repository's rounded visual language for panels, controls, badges, metadata, and previews.
- Cabinet member cards retain the preferred legacy frame composition; the admin preview remains portrait-oriented for upload guidance.
- Existing desktop behavior and data flows remain unchanged.

## Validation

- `npm run check` passes, including a unit check for missing auth configuration.
- Repository search finds no `#section-01`, `/kegiatan`, or `/privacy` links.
- Desktop/mobile browser checks show valid headings, links, and no chatbot image-ratio warning.
- Certificate checker remains functional and visually coherent at desktop and mobile widths.
- Cabinet cards preserve the legacy frame, member labels, fallback initials, and responsive behavior at desktop and mobile widths.

## Out of scope

- Public API error-contract changes and parallax eager-loading; both need separate behavioral/performance evidence.
- Mobile `SliderNavigation` changes; it is already hidden and the observed controls were development tooling.
