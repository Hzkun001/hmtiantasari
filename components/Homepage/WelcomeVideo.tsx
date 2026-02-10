'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './WelcomeVideo.module.css';

// Animation configuration constants
const ANIMATION_CONFIG = {
    clipPath: {
        duration: 1.3,
        ease: "hop",
        from: "polygon(48% 48%, 52% 48%, 52% 52%, 48% 52%)",
        to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    },
    video: {
        duration: 1.3,
        ease: "hop",
        scaleFrom: 1.3,
        scaleTo: 1,
    },
    text: {
        header: {
            duration: 2.5,
            ease: "elastic.out(1, 0.5)",
            stagger: 0.10,
            delay: 0.7,
        },
    },
    characters: {
        duration: 1.2,
        delay: 0.8,
        moveDistance: 100,
    },
    fade: {
        duration: 0.5,
        delay: 0.2,
    },
};

export default function HeroReveal() {
    // Refs
    const refs = {
        section: useRef<HTMLElement>(null),
        heroBg: useRef<HTMLDivElement>(null),
        header: useRef<HTMLDivElement>(null),
        characterLeft: useRef<HTMLDivElement>(null),
        characterRight: useRef<HTMLDivElement>(null),
        footer: useRef<HTMLDivElement>(null),
    };

    // Helper: Split text utility
    const createSplitText = (selector: string | Element | Element[], type: string, className: string) => {
        return new SplitText(selector, {
            type,
            [`${type}Class`]: className,
        });
    };

    useEffect(() => {
        // Register plugins
        gsap.registerPlugin(CustomEase, SplitText, ScrollTrigger);
        CustomEase.create("hop", "0.9, 0, 0.1, 1");

        if (!refs.section.current || !refs.header.current) return;

        // Split text for header
        const headerEl = refs.header.current.querySelector('h1');
        if (!headerEl) return;
        const headerSplit = createSplitText(headerEl, "chars", "char");

        // Main timeline
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: refs.section.current,
                start: "top bottom",
                end: "bottom center",
                toggleActions: "play none none reverse",
            }
        });

        // Animate polaroid frame reveal
        const animateFrameReveal = () => {
            const { clipPath, video } = ANIMATION_CONFIG;

            tl.fromTo(refs.heroBg.current,
                { clipPath: clipPath.from },
                { clipPath: clipPath.to, duration: clipPath.duration, ease: clipPath.ease }
            );

            tl.fromTo(refs.heroBg.current!.querySelector('video'),
                { scale: video.scaleFrom },
                { scale: video.scaleTo, duration: video.duration, ease: video.ease },
                "<"
            );
        };

        // Animate fade in elements
        const animateFadeIn = () => {
            const fadeElements = [
                refs.header.current,
                refs.footer.current
            ].filter(Boolean);

            tl.to(fadeElements, {
                opacity: 1,
                duration: ANIMATION_CONFIG.fade.duration,
            }, ANIMATION_CONFIG.fade.delay);
        };

        // Animate text elements
        const animateText = () => {
            const { text } = ANIMATION_CONFIG;

            // Header text
            tl.to(refs.header.current!.querySelectorAll('.char'), {
                x: "0%",
                scale: 1,
                rotationX: 0,
                duration: text.header.duration,
                ease: text.header.ease,
                stagger: text.header.stagger,
            }, text.header.delay);

        };

        // Animate characters
        const animateCharacters = () => {
            const { characters } = ANIMATION_CONFIG;
            const characterAnimations = [
                { ref: refs.characterLeft, x: -characters.moveDistance, ease: "back.out(1.7)" },
                { ref: refs.characterRight, x: characters.moveDistance, ease: "power3.out" }
            ];

            characterAnimations.forEach(({ ref, x, ease }) => {
                if (ref.current) {
                    tl.fromTo(ref.current,
                        { opacity: 0, x },
                        { opacity: 1, x: 0, duration: characters.duration, ease },
                        characters.delay
                    );
                }
            });
        };

        // Execute animations
        if (refs.heroBg.current) animateFrameReveal();
        animateFadeIn();
        animateText();
        animateCharacters();

        // Cleanup
        return () => {
            headerSplit.revert();
            tl.kill();
        };
    }, []);

    return (
        <section id="section-01" className={`${styles.hero} hero-reveal-section`} ref={refs.section}>
            <div className="container">
                {/* Header Section */}
                <div className={styles.header} ref={refs.header} style={{ fontFamily: 'var(--font-bentham)' }}>
                    <h1>WELCOME ~  ~ WELCOME</h1>
                </div>

                {/* Video Frame */}
                <div className={styles.scene}>
                    <div className={styles.heroBg} ref={refs.heroBg}>
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="metadata"
                            onLoadedMetadata={(e) => {
                                e.currentTarget.currentTime = 3;
                            }}
                        >
                            <source src="/hero-vid.webm" type="video/webm" />
                        </video>
                    </div>

                    {/* Character Left */}
                    <div className={styles.characterLeft} ref={refs.characterLeft}>
                        <Image
                            src="/Ykiri.svg"
                            width={412}
                            height={412}
                            sizes="(max-width: 768px) 120px, 170px"
                            alt="Character Left"
                        />
                    </div>

                    {/* Character Right */}
                    <div className={styles.characterRight} ref={refs.characterRight}>
                        <Image
                            src="/Ykanan.svg"
                            width={412}
                            height={412}
                            sizes="(max-width: 768px) 120px, 170px"
                            alt="Character Right"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
