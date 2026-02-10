'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function HeroSection() {
    const heroRef = useRef<HTMLElement>(null);
    const skyRef = useRef<HTMLImageElement>(null);
    const skyMobileRef = useRef<HTMLImageElement>(null);
    const mountainsRef = useRef<HTMLImageElement>(null);
    const manRef = useRef<HTMLImageElement>(null);
    const manMobileRef = useRef<HTMLImageElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const titleSpansRef = useRef<HTMLSpanElement[]>([]);
    const subtitleRef = useRef<HTMLHeadingElement>(null);
    const actionRef = useRef<HTMLAnchorElement>(null);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const ctaRowRef = useRef<HTMLDivElement>(null);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const autoScrollTriggeredRef = useRef(false);
    const lenisRecoveryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Check for prefers-reduced-motion
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            const checkDevice = () => window.matchMedia('(min-width: 768px)').matches;
            let isDesktop = checkDevice();

            // Hero entrance animations
            const heroElements = [
                subtitleRef.current,
                ...titleSpansRef.current.filter(Boolean),
                descriptionRef.current,
                ctaRowRef.current,
                actionRef.current,
            ].filter(Boolean);

            gsap.fromTo(
                heroElements,
                {
                    autoAlpha: 0,
                    y: 100,
                },
                {
                    autoAlpha: 1,
                    y: 0,
                    stagger: 0.2,
                    duration: 1,
                    ease: 'power2.out',
                }
            );

            // Function to get parallax values based on device
            const getParallaxValues = (desktop: boolean) => desktop
                ? { sky: 300, mountains: -300, man: -100, content: 450 }
                : { sky: -100, mountains: 0, man: 0, content: 0 };

            // Parallax scroll animations dengan auto-scroll ke HeroReveal
            if (heroRef.current) {
                const parallaxValues = getParallaxValues(isDesktop);

                const scrollTriggerInstance = gsap.timeline({
                    scrollTrigger: {
                        trigger: heroRef.current,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: isDesktop ? 0.5 : 0.2, // Kurangi lag parallax di mobile
                        invalidateOnRefresh: true,
                        onUpdate: (self) => {
                            // Auto-scroll hanya aktif di desktop
                            if (isDesktop && self.progress >= 0.4 && !autoScrollTriggeredRef.current) {
                                autoScrollTriggeredRef.current = true;

                                // Cari HeroReveal section
                                const heroRevealSection = document.querySelector('.hero-reveal-section');

                                if (heroRevealSection && window.lenis) {
                                    if (lenisRecoveryTimeoutRef.current) {
                                        clearTimeout(lenisRecoveryTimeoutRef.current);
                                    }

                                    // Lock scroll saat autoscroll berjalan
                                    window.lenis.stop();

                                    // Fallback: pastikan Lenis aktif lagi kalau onComplete tidak terpanggil
                                    lenisRecoveryTimeoutRef.current = setTimeout(() => {
                                        window.lenis?.start();
                                        lenisRecoveryTimeoutRef.current = null;
                                    }, 2200);

                                    // Gunakan Lenis untuk smooth scroll
                                    window.lenis.scrollTo(heroRevealSection as HTMLElement, {
                                        duration: 1.5,
                                        easing: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
                                        offset: -50,
                                        lock: true,
                                        force: true,
                                        onComplete: () => {
                                            if (lenisRecoveryTimeoutRef.current) {
                                                clearTimeout(lenisRecoveryTimeoutRef.current);
                                                lenisRecoveryTimeoutRef.current = null;
                                            }
                                            // Unlock scroll setelah autoscroll selesai
                                            if (window.lenis) {
                                                window.lenis.start();
                                            }
                                        }
                                    });
                                }
                            }
                        },
                        onLeaveBack: () => {
                            // Reset flag saat scroll kembali ke atas
                            autoScrollTriggeredRef.current = false;
                        },
                    },
                })
                    .to([skyRef.current, skyMobileRef.current].filter(Boolean), { y: parallaxValues.sky }, '0')
                    .to(mountainsRef.current, { y: parallaxValues.mountains }, '0');
                scrollTriggerInstance.to([manRef.current, manMobileRef.current].filter(Boolean), { y: parallaxValues.man }, '0');

                if (isDesktop) {
                    scrollTriggerInstance.to(contentRef.current, { y: parallaxValues.content, autoAlpha: 0 }, '0');
                } else {
                    // Di mobile, jangan cepat menghilangkan konten hero (biar landing page tetap informatif)
                    scrollTriggerInstance.to(contentRef.current, { y: 0, autoAlpha: 1 }, '0');
                }

                // Handle resize to update parallax values
                const handleResize = () => {
                    const nowDesktop = checkDevice();
                    if (nowDesktop !== isDesktop) {
                        isDesktop = nowDesktop;
                        ScrollTrigger.refresh();
                    }
                };

                const mediaElements = [
                    skyRef.current,
                    skyMobileRef.current,
                    mountainsRef.current,
                    manRef.current,
                    manMobileRef.current,
                ].filter((el): el is HTMLImageElement => Boolean(el));

                const mediaCleanup: Array<() => void> = [];
                let pendingMedia = 0;

                const refreshAfterMediaReady = () => {
                    requestAnimationFrame(() => ScrollTrigger.refresh());
                };

                mediaElements.forEach((img) => {
                    if (img.complete) return;
                    pendingMedia += 1;

                    const onSettled = () => {
                        pendingMedia -= 1;
                        if (pendingMedia === 0) {
                            refreshAfterMediaReady();
                        }
                    };

                    img.addEventListener('load', onSettled, { once: true });
                    img.addEventListener('error', onSettled, { once: true });
                    mediaCleanup.push(() => {
                        img.removeEventListener('load', onSettled);
                        img.removeEventListener('error', onSettled);
                    });
                });

                if (pendingMedia === 0) {
                    refreshAfterMediaReady();
                }

                window.addEventListener('resize', handleResize);
                return () => {
                    window.removeEventListener('resize', handleResize);
                    mediaCleanup.forEach((cleanup) => cleanup());
                };
            }
        });

        return () => {
            if (lenisRecoveryTimeoutRef.current) {
                clearTimeout(lenisRecoveryTimeoutRef.current);
                lenisRecoveryTimeoutRef.current = null;
            }
            window.lenis?.start();
            ctx.revert();
        };
    }, [prefersReducedMotion]);

    return (
        <section ref={heroRef} className="hero-section section" id="section-00">
            <div className="hero-image-wrapper">
                <img
                    ref={skyRef}
                    src="/sky.png"
                    width={1620}
                    height={939}
                    className="sky"
                    alt="Sky background"
                    fetchPriority="high"
                />
                <img
                    ref={mountainsRef}
                    src="/mountains.webp"
                    width={2301}
                    height={1578}
                    className="mountains"
                    alt="Mountains"
                    fetchPriority="high"
                />
                <img
                    ref={skyMobileRef}
                    src="/sky-mobile.webp"
                    width={646}
                    height={1113}
                    className="sky-mobile"
                    alt=""
                    aria-hidden="true"
                    fetchPriority="high"
                />
                <img
                    src="/mountains-mobile.webp"
                    width={1710}
                    height={2950}
                    className="mountains-mobile"
                    alt=""
                    aria-hidden="true"
                    fetchPriority="high"
                />
                <img
                    ref={manRef}
                    src="/man-standing.png"
                    width={1920}
                    height={1358}
                    className="man-standing"
                    alt="Hiker"
                />
                <img
                    ref={manMobileRef}
                    src="/man-standing-mobile.webp"
                    width={788}
                    height={1358}
                    className="man-standing-mobile"
                    alt=""
                    aria-hidden="true"
                    fetchPriority="high"
                />
            </div>

            <div ref={contentRef} className="hero-content">
                <h5 ref={subtitleRef} className="hero-subtitle">- TI Antasari -</h5>
                <h1 className="hero-title">
                    <span ref={(el) => {
                        if (el) titleSpansRef.current[0] = el;
                    }}> Himpunan Mahasiswa
                    </span>{' '}
                    <br />
                    <span ref={(el) => {
                        if (el) titleSpansRef.current[1] = el;
                    }}>
                        <span className="hero-title-word--mobile-hide">Teknologi Informasi</span>
                        
                    </span>
                </h1>
                <div ref={ctaRowRef} className="hero-cta-row" aria-label="Quick links">
                </div>
                <a ref={actionRef} href="#section-01" className="hero-action">
                    Scroll down
                    <svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 16L14.59 14.59L9 20.17V0H7V20.17L1.42 14.58L0 16L8 24L16 16Z" fill="currentColor"></path>
                    </svg>
                </a>
            </div>
        </section>
    );
}
