'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Paste Cloudinary optimized MP4 URL for mobile hero cinematic here.
const MOBILE_HERO_VIDEO_URL = 'https://res.cloudinary.com/dxlmztdlg/video/upload/f_auto/q_auto:good,vc_auto,w_1280,c_limit/v1770998713/output2_svhzuz.mp4';

const MOBILE_HERO_LINKS = [
    { label: 'ABOUT', href: '/sejarah-kami' },
    { label: 'CABINET', href: '/kabinet' },
    { label: 'NEWS', href: '/berita' },
] as const;
const MOBILE_HERO_STEPS = ['01', '02', '03', '04'] as const;
const MOBILE_HERO_TIMELINE_DURATION_MS = 3600;

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
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const ctaRowRef = useRef<HTMLDivElement>(null);
    const mobileVideoRef = useRef<HTMLVideoElement>(null);

    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [isDesktopViewport, setIsDesktopViewport] = useState(false);
    const [isMobileVideoPlaying, setIsMobileVideoPlaying] = useState(true);
    const [mobileVideoError, setMobileVideoError] = useState(false);
    const [activeMobileStep, setActiveMobileStep] = useState(0);

    const autoScrollTriggeredRef = useRef(false);
    const lenisRecoveryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const hasMobileVideo = MOBILE_HERO_VIDEO_URL.trim().length > 0;
    const shouldAnimateMobileTimeline =
        !isDesktopViewport &&
        !prefersReducedMotion &&
        (!hasMobileVideo || (hasMobileVideo && isMobileVideoPlaying && !mobileVideoError));

    useEffect(() => {
        const heroElement = heroRef.current;
        if (!heroElement) return;

        const className = 'home-cinematic-hero';
        const toggleHeaderTransparency = (active: boolean) => {
            document.body.classList.toggle(className, active);
        };

        const syncByViewport = () => {
            const rect = heroElement.getBoundingClientRect();
            const active = rect.top < window.innerHeight * 0.55 && rect.bottom > window.innerHeight * 0.25;
            toggleHeaderTransparency(active);
        };

        syncByViewport();

        const observer = new IntersectionObserver(
            ([entry]) => {
                const active = entry.isIntersecting && entry.intersectionRatio > 0.25;
                toggleHeaderTransparency(active);
            },
            {
                threshold: [0, 0.25, 0.5, 0.75, 1],
            }
        );

        observer.observe(heroElement);
        window.addEventListener('resize', syncByViewport);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', syncByViewport);
            document.body.classList.remove(className);
        };
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 768px)');
        const syncViewport = () => setIsDesktopViewport(mediaQuery.matches);

        syncViewport();
        mediaQuery.addEventListener('change', syncViewport);

        return () => mediaQuery.removeEventListener('change', syncViewport);
    }, []);

    useEffect(() => {
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(motionQuery.matches);

        const handleChange = () => setPrefersReducedMotion(motionQuery.matches);
        motionQuery.addEventListener('change', handleChange);

        return () => {
            motionQuery.removeEventListener('change', handleChange);
            document.body.classList.remove('overflow-hidden');
            document.body.removeAttribute('data-lenis-prevent');
        };
    }, []);

    useEffect(() => {
        if (prefersReducedMotion || !isDesktopViewport) return;

        const ctx = gsap.context(() => {
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

            if (!heroRef.current) return;

            const parallaxValues = { sky: 300, mountains: -300, man: -100, content: 450 };
            const scrollTriggerInstance = gsap.timeline({
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 0.5,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        if (self.progress < 0.4 || autoScrollTriggeredRef.current) return;

                        autoScrollTriggeredRef.current = true;
                        const heroRevealSection = document.querySelector('.hero-reveal-section');

                        if (!heroRevealSection || !window.lenis) return;

                        if (lenisRecoveryTimeoutRef.current) {
                            clearTimeout(lenisRecoveryTimeoutRef.current);
                        }

                        window.lenis.stop();

                        lenisRecoveryTimeoutRef.current = setTimeout(() => {
                            window.lenis?.start();
                            lenisRecoveryTimeoutRef.current = null;
                        }, 2200);

                        window.lenis.scrollTo(heroRevealSection as HTMLElement, {
                            duration: 1.5,
                            easing: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
                            offset: 0,
                            lock: true,
                            force: true,
                            onComplete: () => {
                                if (lenisRecoveryTimeoutRef.current) {
                                    clearTimeout(lenisRecoveryTimeoutRef.current);
                                    lenisRecoveryTimeoutRef.current = null;
                                }
                                window.lenis?.start();
                            },
                        });
                    },
                    onLeaveBack: () => {
                        autoScrollTriggeredRef.current = false;
                    },
                },
            });

            scrollTriggerInstance
                .to(skyRef.current, { y: parallaxValues.sky }, '0')
                .to(mountainsRef.current, { y: parallaxValues.mountains }, '0')
                .to(manRef.current, { y: parallaxValues.man }, '0')
                .to(contentRef.current, { y: parallaxValues.content, autoAlpha: 0 }, '0');

            const mediaElements = [skyRef.current, mountainsRef.current, manRef.current].filter(
                (el): el is HTMLImageElement => Boolean(el)
            );

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

            return () => {
                mediaCleanup.forEach((cleanup) => cleanup());
            };
        });

        return () => {
            if (lenisRecoveryTimeoutRef.current) {
                clearTimeout(lenisRecoveryTimeoutRef.current);
                lenisRecoveryTimeoutRef.current = null;
            }
            window.lenis?.start();
            ctx.revert();
        };
    }, [isDesktopViewport, prefersReducedMotion]);

    useEffect(() => {
        if (!shouldAnimateMobileTimeline) return;

        const intervalId = window.setInterval(() => {
            setActiveMobileStep((currentStep) => (currentStep + 1) % MOBILE_HERO_STEPS.length);
        }, MOBILE_HERO_TIMELINE_DURATION_MS);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [shouldAnimateMobileTimeline]);

    const toggleMobileVideo = async () => {
        const video = mobileVideoRef.current;
        if (!video) return;

        if (video.paused) {
            try {
                await video.play();
            } catch (error) {
                console.error('Unable to play mobile hero video:', error);
            }
            return;
        }

        video.pause();
    };

    return (
        <section ref={heroRef} className="hero-section hero-section-cinematic section" id="section-00">
            <div className="hero-mobile-cinematic" aria-label="Cinematic mobile hero">
                <div className="hero-mobile-cinematic-frame">
                    {hasMobileVideo && !mobileVideoError ? (
                        <video
                            ref={mobileVideoRef}
                            className="hero-mobile-cinematic-video"
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="metadata"
                            onPlay={() => setIsMobileVideoPlaying(true)}
                            onPause={() => setIsMobileVideoPlaying(false)}
                            onError={() => {
                                setMobileVideoError(true);
                                setIsMobileVideoPlaying(false);
                            }}
                        >
                            <source src={MOBILE_HERO_VIDEO_URL} />
                        </video>
                    ) : (
                        <div className="hero-mobile-cinematic-placeholder">
                            Tempel URL Cloudinary video kamu di
                            <code> MOBILE_HERO_VIDEO_URL</code>
                        </div>
                    )}

                    <div className="hero-mobile-cinematic-scrim" aria-hidden="true" />

                    <div className="hero-mobile-cinematic-top">
                        <h2 className="hero-mobile-cinematic-brand">HMTI ANTASARI</h2>
                        <div className="hero-mobile-cinematic-links" aria-label="Quick links mobile hero">
                            {MOBILE_HERO_LINKS.map((item) => (
                                <a key={item.label} href={item.href} className="hero-mobile-cinematic-chip">
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* <button
                        type="button"
                        className="hero-mobile-cinematic-play"
                        onClick={toggleMobileVideo}
                        disabled={!hasMobileVideo || mobileVideoError}
                        aria-label={isMobileVideoPlaying ? 'Pause video hero' : 'Play video hero'}
                    >
                        {isMobileVideoPlaying ? 'PAUSE' : 'PLAY'}
                    </button> */}

                    <div className="hero-mobile-cinematic-timeline" aria-hidden="true">
                        <span
                            key={activeMobileStep}
                            className="hero-mobile-cinematic-timeline-progress"
                            style={{
                                animationDuration: `${MOBILE_HERO_TIMELINE_DURATION_MS}ms`,
                                animationPlayState: shouldAnimateMobileTimeline ? 'running' : 'paused',
                            }}
                        />
                    </div>

                    <div className="hero-mobile-cinematic-bottom">
                        <div className="hero-mobile-cinematic-meta">
                            <p>Workshop - Machine Learning</p>
                            <p>Directed by BDK</p>
                        </div>
                        <div className="hero-mobile-cinematic-counter" aria-label="Hero sequence index">
                            {MOBILE_HERO_STEPS.map((stepLabel, index) => (
                                <span key={stepLabel} className={index === activeMobileStep ? 'is-active' : ''}>
                                    {stepLabel}
                                </span>
                            ))}
                        </div>
                        <span className="hero-mobile-cinematic-corner" aria-hidden="true" />
                    </div>
                </div>
            </div>

            {isDesktopViewport && (
                <>
                    <div className="hero-image-wrapper" aria-hidden="true">
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
                            ref={manRef}
                            src="/man-standing.png"
                            width={1920}
                            height={1358}
                            className="man-standing"
                            alt="Hiker"
                        />
                    </div>

                    <div ref={contentRef} className="hero-content">
                        <h5 ref={subtitleRef} className="hero-subtitle">- TI Antasari -</h5>
                        <h1 className="hero-title">
                            <span
                                ref={(el) => {
                                    if (el) titleSpansRef.current[0] = el;
                                }}
                            >
                                {' '}
                                Himpunan Mahasiswa
                            </span>{' '}
                            <br />
                            <span
                                ref={(el) => {
                                    if (el) titleSpansRef.current[1] = el;
                                }}
                            >
                                <span className="hero-title-word--mobile-hide">Teknologi Informasi</span>
                            </span>
                        </h1>
                        <p ref={descriptionRef} className="hero-description">
                            Wadah belajar, berkarya, dan bertumbuh bersama mahasiswa Teknologi Informasi UIN Antasari.
                        </p>
                        <div ref={ctaRowRef} className="hero-cta-row" aria-label="Quick links">
                            <a href="#section-01" className="hero-cta hero-cta-primary">
                                Jelajahi
                            </a>
                            <a href="/kegiatan" className="hero-cta hero-cta-secondary">
                                Kegiatan
                            </a>
                        </div>
                        <a ref={actionRef} href="#section-01" className="hero-action">
                            Scroll down
                            <svg width="20" height="12" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 16L14.59 14.59L9 20.17V0H7V20.17L1.42 14.58L0 16L8 24L16 16Z" fill="currentColor"></path>
                            </svg>
                        </a>
                    </div>
                </>
            )}
        </section>
    );
}
