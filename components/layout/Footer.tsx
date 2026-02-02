'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
    const footerRef = useRef<HTMLElement | null>(null);

    const navRef = useRef<HTMLDivElement | null>(null);
    const rightRef = useRef<HTMLDivElement | null>(null);
    const bottomLinksRef = useRef<HTMLDivElement | null>(null);
    const logoRowRef = useRef<HTMLDivElement | null>(null);
    const copyRef = useRef<HTMLDivElement | null>(null);

    // Wordmark besar (Footer-HMTI.svg) wrapper + img element
    const wordmarkWrapRef = useRef<HTMLDivElement | null>(null);
    const wordmarkImgRef = useRef<HTMLImageElement | null>(null);

    // SVG stroke animation ref
    const svgStrokeRef = useRef<SVGSVGElement | null>(null);

    useLayoutEffect(() => {
        if (!footerRef.current) return;

        const reduceMotion =
            typeof window !== 'undefined' &&
            window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

        if (reduceMotion) return;

        const ctx = gsap.context(() => {
            const footer = footerRef.current!;
            const stDefaults = { ease: 'power3.out' as const };

            // ====== Section entrance timeline ======
            const tl = gsap.timeline({
                defaults: stDefaults,
                scrollTrigger: {
                    trigger: footer,
                    start: 'top 85%',
                },
            });

            // Nav kiri
            if (navRef.current) {
                tl.fromTo(navRef.current, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0);
            }

            // Kanan (social + address)
            if (rightRef.current) {
                tl.fromTo(rightRef.current, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.08);
            }

            // Bottom links
            if (bottomLinksRef.current) {
                tl.fromTo(
                    bottomLinksRef.current,
                    { y: 14, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6 },
                    0.18
                );
            }

            // Logo row
            if (logoRowRef.current) {
                tl.fromTo(
                    logoRowRef.current,
                    { y: 18, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.7 },
                    0.24
                );
            }

            // Copyright
            if (copyRef.current) {
                tl.fromTo(copyRef.current, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.32);
            }

            // ====== Wordmark besar: Elegant Luxury Text Reveal ======
            if (wordmarkWrapRef.current && wordmarkImgRef.current) {
                const wordmarkWrap = wordmarkWrapRef.current;
                const wordmarkImg = wordmarkImgRef.current;

                // Initial state: hidden with elegant positioning
                gsap.set(wordmarkImg, {
                    opacity: 0,
                    y: 40,
                    scale: 0.92,
                    filter: 'blur(8px) brightness(0.7)',
                });

                // Main entrance animation - smooth and luxurious
                const revealTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: wordmarkWrap,
                        start: 'top 80%',
                        end: 'top 40%',
                        scrub: 1.5, // Smooth scrubbed animation
                    },
                });

                // Elegant fade in with float up
                revealTl.to(wordmarkImg, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: 'blur(0px) brightness(1)',
                    duration: 1.2,
                    ease: 'power3.out',
                });

                // Add shimmer/shine effect passing through text
                revealTl.fromTo(
                    wordmarkImg,
                    {
                        '--shine-position': '-150%',
                    },
                    {
                        '--shine-position': '150%',
                        duration: 1.5,
                        ease: 'power2.inOut',
                    },
                    0.3
                );

                // Continuous subtle parallax
                gsap.to(wordmarkImg, {
                    y: -20,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: footer,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 2,
                    },
                });

                // Gentle breathing scale effect
                gsap.to(wordmarkImg, {
                    scale: 1.02,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                    duration: 3,
                });
            }

            // ====== SVG Draw-On Line Animation (Fixed) ======
            if (svgStrokeRef.current) {
                const svg = svgStrokeRef.current;

                // target semua geometry (lebih aman)
                const geometries = svg.querySelectorAll<SVGGeometryElement>(
                    'path, line, polyline, polygon, circle, rect'
                );

                // Set style supaya garis terlihat "digambar"
                gsap.set(geometries, {
                    // bantu rendering
                    vectorEffect: 'non-scaling-stroke',
                });

                geometries.forEach((g) => {
                    let length = 0;
                    try {
                        length = g.getTotalLength();
                    } catch {
                        return;
                    }
                    if (!length || !Number.isFinite(length)) return;

                    // initial hidden
                    gsap.set(g, {
                        strokeDasharray: length,
                        strokeDashoffset: length,
                        opacity: 1,
                    });
                });

                // Timeline scrub panjang (bukan duration)
                gsap.timeline({
                    scrollTrigger: {
                        trigger: svg,
                        start: 'top 5%',
                        end: 'top 95%',
                        scrub: 6.5,
                        invalidateOnRefresh: true,
                    },
                    defaults: { ease: 'none' },
                }).to(geometries, {
                    strokeDashoffset: 0,
                    stagger: 0.01,
                });
            }


            // ====== Hover micro-interaction untuk semua link ======
            // Kita kasih underline + geser tipis. Tidak mengubah style awal (warna & size tetap).
            const links = footer.querySelectorAll<HTMLAnchorElement>('a[data-footer-link="true"]');

            links.forEach((a) => {
                // Tambah underline element secara DOM (biar ga ubah markup kamu banyak)
                // Kalau sudah ada underline, skip.
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

                    // Pastikan anchor bisa punya pseudo underline absolute
                    a.style.position = 'relative';
                    a.appendChild(line);
                }

                const underline = a.querySelector<HTMLElement>('[data-underline="true"]')!;
                gsap.set(underline, { scaleX: 0, transformOrigin: 'left center' });

                const onEnter = () => {
                    gsap.to(a, { x: 3, duration: 0.25, ease: 'power2.out' });
                    gsap.to(underline, { scaleX: 1, duration: 0.35, ease: 'power2.out' });
                };

                const onLeave = () => {
                    gsap.to(a, { x: 0, duration: 0.25, ease: 'power2.out' });
                    gsap.to(underline, { scaleX: 0, duration: 0.35, ease: 'power2.out' });
                };

                a.addEventListener('mouseenter', onEnter);
                a.addEventListener('mouseleave', onLeave);

                // Cleanup otomatis via ctx.revert(), tapi listener manual tetap perlu dibersihkan:
                ScrollTrigger.addEventListener('refreshInit', () => {
                    a.removeEventListener('mouseenter', onEnter);
                    a.removeEventListener('mouseleave', onLeave);
                });
            });
        }, footerRef);

        return () => ctx.revert();
    }, []);

    return (
        <footer
            ref={footerRef}
            className="relative bg-[#1a1a1a] pt-10 md:pt-20 pb-0 border-t-2 border-neutral-800"
        >
            <div className="container">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-12 mb-16">
                    {/* Left Navigation */}
                    <div ref={navRef} className="lg:col-span-3">
                        <nav className="space-y-4">
                            <a
                                data-footer-link="true"
                                href="#about"
                                className="block text-2xl md:text-3xl font-medium text-[#FFD56C] hover:text-neutral-400 transition-colors"
                            >
                                ABOUT US
                            </a>
                            <a
                                data-footer-link="true"
                                href="#services"
                                className="block text-2xl md:text-3xl font-medium text-[#FFD56C] hover:text-neutral-400 transition-colors"
                            >
                                SERVICES
                            </a>
                            <a
                                data-footer-link="true"
                                href="#works"
                                className="block text-2xl md:text-3xl font-medium text-[#FFD56C] hover:text-neutral-400 transition-colors"
                            >
                                WORKS
                            </a>
                        </nav>
                    </div>

                    {/* Middle Spacer */}
                    <div className="hidden lg:block lg:col-span-3"></div>

                    {/* Right Content */}
                    <div ref={rightRef} className="lg:col-span-6 space-y-8 text-right">
                        {/* Social Links */}
                        <div className="flex flex-wrap justify-end gap-4 md:gap-6">
                            <a
                                data-footer-link="true"
                                href="https://instagram.com/hmti"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-base md:text-lg font-medium text-[#FFD56C] hover:text-neutral-400 transition-colors flex items-center gap-2"
                            >
                                INSTAGRAM
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline">
                                    <path
                                        d="M3 13L13 3M13 3H5M13 3V11"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </a>

                            <a
                                data-footer-link="true"
                                href="https://twitter.com/hmti"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-base md:text-lg font-medium text-[#FFD56C] hover:text-neutral-400 transition-colors flex items-center gap-2"
                            >
                                TWITTER
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline">
                                    <path
                                        d="M3 13L13 3M13 3H5M13 3V11"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </a>

                            <a
                                data-footer-link="true"
                                href="mailto:hmti@yourdomain.com"
                                className="text-base md:text-lg font-medium text-[#FFD56C] hover:text-neutral-400 transition-colors flex items-center gap-2"
                            >
                                EMAIL
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline">
                                    <path
                                        d="M3 13L13 3M13 3H5M13 3V11"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </a>
                        </div>

                        {/* Address */}
                        <div className="text-sm md:text-base text-neutral-300 font-mono">
                            <p className="mb-1">Address:</p>
                            <p>UIN Antasari Banjarmasin</p>
                            <p>Banjarmasin, Indonesia</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Links */}
                <div
                    ref={bottomLinksRef}
                    className="flex flex-wrap gap-4 md:gap-8 mb-12 text-sm md:text-base font-mono text-neutral-300"
                >
                    <a
                        data-footer-link="true"
                        href="https://github.com/hmti"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                    >
                        [ GITHUB ]
                    </a>
                    <a
                        data-footer-link="true"
                        href="https://behance.net/hmti"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                    >
                        [ BEHANCE ]
                    </a>
                    <a
                        data-footer-link="true"
                        href="https://dribbble.com/hmti"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                    >
                        [ DRIBBBLE ]
                    </a>
                </div>

                {/* Large Logo Section */}
                <div ref={logoRowRef} className="relative w-full mb-8 overflow-hidden">
                    <div className="flex items-end gap-4 md:gap-6 lg:gap-8">
                        {/* Kabinet Logo on Left */}
                        <div className="shrink-0">
                            <Image
                                src="/images/teknologi-informasi.svg"
                                alt="Kabinet Arnanta"
                                width={120}
                                height={120}
                                className="w-16 h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 object-contain"
                            />
                        </div>

                        {/* Large SVG Text (reveal wrapper + img ref) */}
                        <div ref={wordmarkWrapRef} className="flex-1 flex items-center justify-center overflow-hidden">
                            {/* Inline SVG with draw-on animation */}
                            <svg
                                ref={svgStrokeRef}
                                width="217"
                                height="70"
                                viewBox="0 0 609 193"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-full max-w-4xl h-auto pointer-events-none select-none"
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
                    className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-neutral-200 font-mono pb-8"
                >
                    <p>&lt;3 YOUR FRIENDS AT HMTI</p>
                    <p>©2026 HMTI KABINET ARNANTA</p>
                </div>
            </div>
        </footer>
    );
}
