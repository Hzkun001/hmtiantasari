'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function HeroSection() {
    const heroRef = useRef<HTMLElement>(null);
    const skyRef = useRef<HTMLImageElement>(null);
    const mountainsRef = useRef<HTMLImageElement>(null);
    const manRef = useRef<HTMLImageElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const titleSpansRef = useRef<HTMLSpanElement[]>([]);
    const subtitleRef = useRef<HTMLHeadingElement>(null);
    const actionRef = useRef<HTMLAnchorElement>(null);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const autoScrollTriggeredRef = useRef(false);

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
                actionRef.current
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
                : { sky: 80, mountains: -80, man: -30, content: 120 };

            // Parallax scroll animations dengan auto-scroll ke HeroReveal
            if (heroRef.current) {
                const parallaxValues = getParallaxValues(isDesktop);

                const scrollTriggerInstance = gsap.timeline({
                    scrollTrigger: {
                        trigger: heroRef.current,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: isDesktop ? 0.5 : 1, // Lebih smooth di mobile
                        invalidateOnRefresh: true,
                        onUpdate: (self) => {
                            // Auto-scroll hanya aktif di desktop
                            if (isDesktop && self.progress >= 0.4 && !autoScrollTriggeredRef.current) {
                                autoScrollTriggeredRef.current = true;

                                // Cari HeroReveal section
                                const heroRevealSection = document.querySelector('.hero-reveal-section');

                                if (heroRevealSection && window.lenis) {
                                    // Lock scroll saat autoscroll berjalan
                                    window.lenis.stop();

                                    // Gunakan Lenis untuk smooth scroll
                                    window.lenis.scrollTo(heroRevealSection as HTMLElement, {
                                        duration: 1,
                                        easing: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
                                        offset: 120,
                                        lock: true,
                                        force: true,
                                        onComplete: () => {
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
                    .to(skyRef.current, { y: parallaxValues.sky }, '0')
                    .to(mountainsRef.current, { y: parallaxValues.mountains }, '0')
                    .to(manRef.current, { y: parallaxValues.man }, '0')
                    .to(contentRef.current, { y: parallaxValues.content, autoAlpha: 0 }, '0');

                // Handle resize to update parallax values
                const handleResize = () => {
                    const nowDesktop = checkDevice();
                    if (nowDesktop !== isDesktop) {
                        isDesktop = nowDesktop;
                        ScrollTrigger.refresh();
                    }
                };

                window.addEventListener('resize', handleResize);
                return () => window.removeEventListener('resize', handleResize);
            }
        });

        return () => ctx.revert();
    }, [prefersReducedMotion]);

    return (
        <section ref={heroRef} className="hero-section section" id="section-00">
            <div className="hero-image-wrapper">
                <img
                    ref={skyRef}
                    src="/sky.png"
                    className="sky"
                    alt="Sky background"
                />
                <img
                    ref={mountainsRef}
                    src="/mountains.png"
                    className="mountains"
                    alt="Mountains"
                />
                <img
                    ref={manRef}
                    src="/man-standing.png"
                    className="man-standing"
                    alt="Hiker"
                />
            </div>

            <div ref={contentRef} className="hero-content">
                <h5 ref={subtitleRef} className="hero-subtitle">- HMTI ANTASARI -</h5>
                <h1 className="hero-title">
                    <span ref={(el) => {
                        if (el) titleSpansRef.current[0] = el;
                    }}> Api Kecil
                    </span>{' '}
                    <br />
                    <span ref={(el) => {
                        if (el) titleSpansRef.current[1] = el;
                    }}> Melahirkan Terang
                    </span>
                </h1>
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
