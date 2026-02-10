'use client';

import Image from 'next/image';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { supabase } from '@/lib/supabase';

gsap.registerPlugin(ScrollTrigger);

type FooterSettings = {
  site_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  youtube_url?: string | null;
};

type SocialLinkItem = {
  label: string;
  href: string;
};

const DEFAULT_ADDRESS_LINES = [
  'Universitas Islam Negeri',
  'Antasari Banjarmasin',
  'Jl. A. Yani KM 4.5',
  'Banjarmasin, Kalimantan Selatan',
  'Indonesia 70235',
];

const DEFAULT_SOCIAL_LINKS: SocialLinkItem[] = [
  { label: 'INSTAGRAM', href: 'https://instagram.com/hmtiantasari' },
  { label: 'TWITTER', href: 'https://x.com/hmtiuinantasari' },
  { label: 'LINKEDIN', href: 'https://linkedin.com/company/hmtiuinantasari' },
];

function normalizeExternalUrl(value?: string | null) {
  const normalized = value?.trim();
  if (!normalized) return null;
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized;
  return `https://${normalized.replace(/^\/+/, '')}`;
}

function toTelHref(value?: string | null) {
  const normalized = value?.trim();
  if (!normalized) return null;
  const cleaned = normalized.replace(/[^\d+]/g, '');
  return cleaned ? `tel:${cleaned}` : null;
}

export default function Footer() {
  const footerRef = useRef<HTMLElement | null>(null);

  const navRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const bottomLinksRef = useRef<HTMLDivElement | null>(null);
  const logoRowRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const wordmarkWrapRef = useRef<HTMLDivElement | null>(null); // masih dipakai sebagai wrapper SVG
  const svgStrokeRef = useRef<SVGSVGElement | null>(null);
  const [settings, setSettings] = useState<FooterSettings | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchFooterSettings() {
      const { data, error } = await supabase
        .from('SiteSettings')
        .select(
          'site_name,contact_email,contact_phone,address,facebook_url,twitter_url,instagram_url,linkedin_url,youtube_url'
        )
        .order('updated_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted || error || !data) return;
      setSettings(data);
    }

    fetchFooterSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const siteName = settings?.site_name?.trim() || 'HMTI UIN Antasari';
  const contactEmail = settings?.contact_email?.trim() || 'hmti@uinantasari.ac.id';
  const contactPhone = settings?.contact_phone?.trim() || null;
  const contactPhoneHref = toTelHref(contactPhone);

  const addressLines = useMemo(() => {
    const rawAddress = settings?.address?.trim();
    if (!rawAddress) return DEFAULT_ADDRESS_LINES;
    const lines = rawAddress
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    return lines.length > 0 ? lines : DEFAULT_ADDRESS_LINES;
  }, [settings?.address]);

  const campusCompactText = useMemo(() => {
    if (addressLines.length === 0) return '';
    return addressLines.slice(0, 2).join(', ');
  }, [addressLines]);

  const socialLinks = useMemo<SocialLinkItem[]>(() => {
    const links: SocialLinkItem[] = [
      { label: 'INSTAGRAM', href: normalizeExternalUrl(settings?.instagram_url) || '' },
      { label: 'TWITTER', href: normalizeExternalUrl(settings?.twitter_url) || '' },
      { label: 'LINKEDIN', href: normalizeExternalUrl(settings?.linkedin_url) || '' },
      { label: 'FACEBOOK', href: normalizeExternalUrl(settings?.facebook_url) || '' },
      { label: 'YOUTUBE', href: normalizeExternalUrl(settings?.youtube_url) || '' },
    ].filter((item) => Boolean(item.href));

    return links.length > 0 ? links : DEFAULT_SOCIAL_LINKS;
  }, [settings]);

  useLayoutEffect(() => {
    if (!footerRef.current) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    if (reduceMotion) return;

    const footerEl = footerRef.current;

    // simpan cleanup hover listener di scope effect (bukan di ctx)
    const hoverCleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const footer = footerEl;
      const stDefaults = { ease: 'power3.out' as const };

      // ===== Section entrance =====
      const tl = gsap.timeline({
        defaults: stDefaults,
        scrollTrigger: {
          trigger: footer,
          start: 'top 85%',
          invalidateOnRefresh: true,
        },
      });

      if (navRef.current) {
        tl.fromTo(navRef.current, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0);
      }
      if (rightRef.current) {
        tl.fromTo(rightRef.current, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.08);
      }
      if (bottomLinksRef.current) {
        tl.fromTo(bottomLinksRef.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.18);
      }
      if (logoRowRef.current) {
        tl.fromTo(logoRowRef.current, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.24);
      }
      if (copyRef.current) {
        tl.fromTo(copyRef.current, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.32);
      }

      // ===== SVG draw-on =====
      if (svgStrokeRef.current) {
        const svg = svgStrokeRef.current;

        const geometries = svg.querySelectorAll<SVGGeometryElement>(
          'path, line, polyline, polygon, circle, rect'
        );

        gsap.set(geometries, { vectorEffect: 'non-scaling-stroke' });

        geometries.forEach((g) => {
          let length = 0;
          try {
            length = g.getTotalLength();
          } catch {
            return;
          }
          if (!length || !Number.isFinite(length)) return;

          gsap.set(g, {
            strokeDasharray: length,
            strokeDashoffset: length,
            opacity: 1,
          });
        });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: svg,
              start: 'top 80%',
              end: 'bottom 30%',
              scrub: 2,
              invalidateOnRefresh: true,
            },
            defaults: { ease: 'none' },
          })
          .to(geometries, { strokeDashoffset: 0, stagger: 0.01 });
      }

      // ===== Hover underline: hanya yang ditandai =====
      // Pakai data-hover="underline" hanya untuk social + bottom links.
      const links = footer.querySelectorAll<HTMLAnchorElement>('a[data-hover="underline"]');

      links.forEach((a) => {
        // Inject underline span jika belum ada
        if (!a.querySelector('[data-underline="true"]')) {
          const line = document.createElement('span');
          line.setAttribute('data-underline', 'true');
          line.style.position = 'absolute';
          line.style.left = '0';
          line.style.right = '0';
          line.style.bottom = '-6px';
          line.style.height = '2px';
          line.style.opacity = '0.7';
          line.style.transform = 'scaleX(0)';
          line.style.transformOrigin = 'left';
          line.style.background = 'currentColor';
          line.style.pointerEvents = 'none';

          a.style.position = 'relative';
          a.style.zIndex = '10';
          a.appendChild(line);
        }

        const underline = a.querySelector<HTMLElement>('[data-underline="true"]');
        if (!underline) return;

        gsap.set(underline, { scaleX: 0, transformOrigin: 'left center' });

        const onEnter = () => {
          a.style.willChange = 'transform';
          gsap.to(a, { x: 3, duration: 0.25, ease: 'power2.out' });
          gsap.to(underline, { scaleX: 1, duration: 0.35, ease: 'power2.out' });
        };

        const onLeave = () => {
          gsap.to(a, {
            x: 0,
            duration: 0.25,
            ease: 'power2.out',
            onComplete: () => {
              a.style.willChange = 'auto';
            },
          });
          gsap.to(underline, { scaleX: 0, duration: 0.35, ease: 'power2.out' });
        };

        a.addEventListener('mouseenter', onEnter);
        a.addEventListener('mouseleave', onLeave);

        hoverCleanups.push(() => {
          a.removeEventListener('mouseenter', onEnter);
          a.removeEventListener('mouseleave', onLeave);
        });
      });

      // refresh setelah setup biar konsisten (layout shift/image/font)
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, footerRef);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad, { once: true });

    return () => {
      window.removeEventListener('load', onLoad);
      hoverCleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [socialLinks]);
  return (
    <footer
      ref={footerRef}
      className="font-bentham relative bg-[#1a1a1a] border-t-2 border-neutral-800 pt-2! md:pt-4! lg:pt-6! pb-2! md:pb-4!"
    >
      <div className="mx-auto w-full max-w-295 px-4 md:px-6">
        <div className="flex flex-col gap-3 md:gap-4">
          {/* Main Footer Content */}
          <div className="grid grid-cols-2 gap-3 md:hidden relative z-20">
            <div className="text-left">
              <p className="text-[11px] font-sans text-neutral-500 mb-2 tracking-[0.2em]">NAVIGASI</p>
              <nav className="space-y-1.5 flex flex-col items-start">
                <a
                  href="/kabinet"
                  className="block text-sm font-medium text-[#FFD56C] hover:text-neutral-400 transition-colors leading-tight"
                >
                  Kabinet
                </a>
                <a
                  href="/sejarah-kami"
                  className="block text-sm font-medium text-[#FFD56C] hover:text-neutral-400 transition-colors leading-tight"
                >
                  Sejarah
                </a>
                <a
                  href="/projects"
                  className="block text-sm font-medium text-[#FFD56C] hover:text-neutral-400 transition-colors leading-tight"
                >
                  Project
                </a>
                <a
                  href="/kegiatan"
                  className="block text-sm font-medium text-[#FFD56C] hover:text-neutral-400 transition-colors leading-tight"
                >
                  Kegiatan
                </a>
                <a
                  href="/certificate-checker"
                  className="block text-sm font-medium text-[#FFD56C] hover:text-neutral-400 transition-colors leading-tight"
                >
                  Certificate
                </a>
              </nav>

              <p className="text-[11px] font-sans text-neutral-500 mt-3 mb-2 tracking-[0.2em]">CONNECT</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {socialLinks.slice(0, 4).map((link) => (
                  <a
                    key={`mobile-${link.label}`}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#FFD56C] hover:text-neutral-400 transition-colors whitespace-nowrap"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="font-sans text-left">
              <p className="text-[11px] text-neutral-500 mb-2 tracking-[0.2em]">KAMPUS</p>
              <p className="text-xs leading-snug text-neutral-300">{campusCompactText}</p>

              <p className="text-[11px] text-neutral-500 mt-3 mb-2 tracking-[0.2em]">EMAIL</p>
              <a
                href={`mailto:${contactEmail}`}
                className="block text-xs text-neutral-300 hover:text-[#FFD56C] transition-colors break-all leading-snug"
              >
                {contactEmail}
              </a>
              {contactPhone && (
                <a
                  href={contactPhoneHref || '#'}
                  className="mt-1 block text-[11px] text-neutral-400 hover:text-[#FFD56C] transition-colors"
                >
                  {contactPhone}
                </a>
              )}
            </div>
          </div>

          <div className="hidden md:grid grid-cols-2 lg:grid-cols-12 gap-4 md:gap-8 relative z-20">
            {/* Left Navigation (TANPA underline effect) */}
            <div ref={navRef} className="lg:col-span-4 relative z-20 text-center md:text-left">
              <p className="text-sm font-sans text-neutral-500 mb-3 tracking-widest">NAVIGASI</p>
              <nav className="space-y-3 flex flex-col items-center md:items-start">
                <a
                  href="/kabinet"
                  className="block text-xl md:text-2xl text-[#FFD56C] hover:text-neutral-400 transition-colors"
                >
                  Kabinet
                </a>
                <a
                  href="/sejarah-kami"
                  className="block text-lg md:text-xl font-medium text-[#FFD56C] hover:text-neutral-400 transition-colors"
                >
                  Sejarah
                </a>
                <a
                  href="/projects"
                  className="block text-lg md:text-xl font-medium text-[#FFD56C] hover:text-neutral-400 transition-colors"
                >
                  Project
                </a>
                <a
                  href="/kegiatan"
                  className="block text-lg md:text-xl font-medium text-[#FFD56C] hover:text-neutral-400 transition-colors"
                >
                  Kegiatan
                </a>
                <a
                  href="/certificate-checker"
                  className="block text-lg md:text-xl font-medium text-[#FFD56C] hover:text-neutral-400 transition-colors"
                >
                  Certificate Checker
                </a>
              </nav>
            </div>

            {/* Middle - Contact */}
            <div className="lg:col-span-4 font-sans relative z-20 text-center md:text-left">
              <p className="text-sm text-neutral-500 mb-3 tracking-widest">CONTACT</p>
              <div className="space-y-2 text-neutral-300">
                {addressLines.map((line, index) => (
                  <p
                    key={`${line}-${index}`}
                    className={`text-base ${index >= 2 ? 'text-neutral-500' : ''}`}
                  >
                    {line}
                  </p>
                ))}
                {contactPhone && (
                  <a
                    href={contactPhoneHref || '#'}
                    className="block text-base text-neutral-400 hover:text-[#FFD56C] transition-colors pt-1"
                  >
                    {contactPhone}
                  </a>
                )}
                <a
                  href={`mailto:${contactEmail}`}
                  className="block text-base text-neutral-400 hover:text-[#FFD56C] transition-colors"
                >
                  {contactEmail}
                </a>
              </div>
            </div>

            {/* Right Content - Social (PAKAI underline effect) */}
            <div ref={rightRef} className="lg:col-span-4 relative z-20">
              <p className="text-sm font-sans text-neutral-500 mb-3 tracking-widest text-center md:text-right">CONNECT</p>

              <div className="flex flex-col items-center md:items-end gap-3">
                {socialLinks.map((link, index) => (
                  <a
                    key={link.label}
                    data-hover="underline"
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group text-base md:text-lg font-medium text-[#FFD56C] hover:text-neutral-400 transition-colors flex items-center gap-3"
                  >
                    <span className="text-xs text-neutral-500 group-hover:text-neutral-400 transition-colors">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {link.label}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="inline transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                    >
                      <path
                        d="M3 13L13 3M13 3H5M13 3V11"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Marquee Text */}
          <div className="relative overflow-hidden py-2 md:py-4 border-y border-neutral-800">
            <div className="flex whitespace-nowrap animate-marquee">
              <span className="text-xl sm:text-2xl md:text-5xl font-bold text-neutral-800 mx-3 sm:mx-4 md:mx-6">HIMPUNAN MAHASISWA</span>
              <span className="text-xl sm:text-2xl md:text-5xl font-bold text-neutral-800 mx-3 sm:mx-4 md:mx-6">•</span>
              <span className="text-xl sm:text-2xl md:text-5xl font-bold text-neutral-800 mx-3 sm:mx-4 md:mx-6">TEKNOLOGI INFORMASI</span>
              <span className="text-xl sm:text-2xl md:text-5xl font-bold text-neutral-800 mx-3 sm:mx-4 md:mx-6">•</span>
              <span className="text-xl sm:text-2xl md:text-5xl font-bold text-neutral-800 mx-3 sm:mx-4 md:mx-6">HIMPUNAN MAHASISWA</span>
              <span className="text-xl sm:text-2xl md:text-5xl font-bold text-neutral-800 mx-3 sm:mx-4 md:mx-6">•</span>
              <span className="text-xl sm:text-2xl md:text-5xl font-bold text-neutral-800 mx-3 sm:mx-4 md:mx-6">TEKNOLOGI INFORMASI</span>
              <span className="text-xl sm:text-2xl md:text-5xl font-bold text-neutral-800 mx-3 sm:mx-4 md:mx-6">•</span>
            </div>
          </div>

          {/* Bottom Links (PAKAI underline effect) */}
          <div
            ref={bottomLinksRef}
            className="flex flex-wrap justify-center md:justify-between items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs md:text-base text-neutral-500 relative z-20"
          >
            <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
              <a data-hover="underline" href="/privacy" className="hover:text-[#FFD56C] transition-colors whitespace-nowrap">
                Privacy Policy
              </a>
              <a data-hover="underline" href="/terms" className="hover:text-[#FFD56C] transition-colors whitespace-nowrap">
                Terms of Service
              </a>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
              <a
                data-hover="underline"
                href="https://github.com/hmtiuinantasari"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#FFD56C] transition-colors whitespace-nowrap"
              >
                GitHub
              </a>
              <a
                data-hover="underline"
                href="https://mastodon.social/@hmtiuinantasari"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#FFD56C] transition-colors whitespace-nowrap"
              >
                Mastodon
              </a>
            </div>
          </div>

          {/* Large Logo Section */}
          <div ref={logoRowRef} className="relative w-full overflow-hidden z-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 md:gap-4 lg:gap-6">
              <div className="shrink-0">
                <a href="/">
                  <Image
                    src="/images/teknologi-informasi.svg"
                    alt={siteName}
                    width={120}
                    height={120}
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 object-contain"
                  />
                </a>
              </div>

              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <svg
                  ref={svgStrokeRef}
                  width="200"
                  height="70"
                  viewBox="0 0 609 193"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full max-w-xl sm:max-w-2xl md:max-w-4xl h-auto pointer-events-none select-none"
                >
                  <path
                    d="M599.039 174.137C601.699 174.137 603.911 175.089 605.637 176.994C607.536 178.71 608.5 180.827 608.5 183.318C608.5 185.815 607.533 188.019 605.638 189.912C603.912 191.636 601.793 192.5 599.311 192.5C596.829 192.5 594.629 191.637 592.73 189.93L592.711 189.912L592.693 189.893C590.985 187.996 590.121 185.798 590.121 183.318C590.121 180.668 590.979 178.456 592.712 176.725C594.437 175.001 596.556 174.137 599.039 174.137ZM24.0381 0.5V87.8604H111.29V0.5H134.828V191.415H111.29V91.5742H24.0381V191.415H0.5V0.5H24.0381ZM198.456 0.5L198.568 0.845703L255.115 174.913L311.395 0.845703L311.506 0.5H321.272L321.327 0.938477L344.951 190.854L345.021 191.415H321.475L321.421 190.976L302.961 41.2852L254.507 191.068L254.395 191.415H236.562L236.449 191.072L187.458 43.1602L169.534 190.975L169.48 191.415H164.941L165.011 190.854L188.636 0.938477L188.69 0.5H198.456ZM488.859 0.5V4.21289H441.61V191.415H418.072V4.21289H371.095V0.5H488.859ZM564.412 0.5V4.21289H551.106V187.702H564.412V191.415H515.077V187.702H527.568V4.21289H515.077V0.5H564.412Z"
                    stroke="#FFD56C"
                    strokeWidth="1"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div
            ref={copyRef}
            className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4 text-sm md:text-base text-neutral-500 border-t border-neutral-800 pt-2 md:pt-4 text-center md:text-left"
          >
            <p>Made with by HMTI UIN Antasari</p>
            <p>© {new Date().getFullYear()} {siteName} - All Rights Reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
