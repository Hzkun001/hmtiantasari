'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function SliderNavigation() {
    const listItemsRef = useRef<HTMLLIElement[]>([]);
    const progressRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        if (prefersReducedMotion) return;

        const isDesktop = window.matchMedia('(min-width: 768px)').matches;
        if (!isDesktop) return;

        const ctx = gsap.context(() => {
            // Animate slider list items entrance
            if (listItemsRef.current.length > 0) {
                gsap.fromTo(
                    listItemsRef.current.filter(Boolean),
                    { autoAlpha: 0, y: 100 },
                    { autoAlpha: 1, y: 0, stagger: 0.2, delay: 1 }
                );
            }

            // Animate slider progress entrance
            if (progressRef.current) {
                gsap.fromTo(
                    progressRef.current,
                    { autoAlpha: 0, y: 100 },
                    { autoAlpha: 1, y: 0, delay: 1 }
                );
            }

            // Animate progress bar based on scroll
            if (progressBarRef.current) {
                gsap.to(progressBarRef.current, {
                    height: '100%',
                    ease: 'none',
                    scrollTrigger: {
                        scrub: 0.3,
                    },
                });
            }
        });

        return () => ctx.revert();
    }, [prefersReducedMotion]);

    return (
        <nav className="slider">
            <div className="container">
                <ul className="slider-list">
                    <li
                        className="slider-list-item"
                        ref={(el) => {
                            if (el) listItemsRef.current[0] = el;
                        }}
                    >
                        <a href="#section-00">Start</a>
                    </li>
                    <li
                        className="slider-list-item"
                        ref={(el) => {
                            if (el) listItemsRef.current[1] = el;
                        }}
                    >
                        <a href="#section-01">01</a>
                    </li>
                    <li
                        className="slider-list-item"
                        ref={(el) => {
                            if (el) listItemsRef.current[2] = el;
                        }}
                    >
                        <a href="#section-02">02</a>
                    </li>
                    <li
                        className="slider-list-item"
                        ref={(el) => {
                            if (el) listItemsRef.current[3] = el;
                        }}
                    >
                        <a href="#projects">03</a>
                    </li>
                    <li
                        className="slider-list-item"
                        ref={(el) => {
                            if (el) listItemsRef.current[4] = el;
                        }}
                    >
                        <a href="#activities">04</a>
                    </li>
                </ul>
                <div ref={progressRef} className="slider-progress">
                    <div ref={progressBarRef} className="slider-progress-bar" style={{ height: '10%' }}></div>
                </div>
            </div>
        </nav>
    );
}
