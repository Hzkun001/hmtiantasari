'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from '../providers/HeroReveal.module.css';

export default function HeroReveal() {
    const sectionRef = useRef<HTMLElement>(null);
    const heroBgRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(CustomEase, SplitText, ScrollTrigger);
        CustomEase.create("hop", "0.9, 0, 0.1, 1");

        const splitText = (selector: string | Element | Element[], type: string, className: string) => {
            return new SplitText(selector, {
                type: type,
                [type + "Class"]: className,
            });
        };

        if (!headerRef.current) return;

        const headerSplit = splitText(headerRef.current.querySelector('h1')!, "chars", "char");
        const navSplit = splitText(Array.from(navRef.current!.querySelectorAll('a')), "words", "word");
        const footerSplit = splitText(Array.from(footerRef.current!.querySelectorAll('p')), "words", "word");

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top center",
                end: "bottom center",
                toggleActions: "play none none reverse",
            }
        });

        if (heroBgRef.current) {
            tl.fromTo(heroBgRef.current, {
                clipPath: "polygon(48% 48%, 52% 48%, 52% 52%, 48% 52%)",
            }, {
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                duration: 1.3,
                ease: "hop",
            });

            tl.fromTo(heroBgRef.current.querySelector('video'), {
                scale: 1.5,
            }, {
                scale: 1,
                duration: 1.3,
                ease: "hop",
            }, "<");
        }

        if (progressRef.current) {
            tl.to(progressRef.current, {
                scaleX: 1,
                duration: 1.3,
                ease: "hop",
            }, "<");
        }

        const fadeElements = [
            progressBarRef.current,
            navRef.current,
            headerRef.current,
            footerRef.current
        ].filter(Boolean);

        tl.to(fadeElements, {
            opacity: 1,
            duration: 0.5,
        }, 0.2);

        tl.to(headerRef.current.querySelectorAll('.char'), {
            x: "0%",
            duration: 1.5,
            ease: "power4.out",
            stagger: 0.05,
        }, 0.5);

        tl.to(navRef.current!.querySelectorAll('.word'), {
            y: "0%",
            duration: 1.5,
            ease: "power4.out",
            stagger: 0.08
        }, 0.7);

        tl.to(footerRef.current!.querySelectorAll('.word'), {
            y: "0%",
            duration: 1.5,
            ease: "power4.out",
            stagger: 0.08
        }, 0.7);

        // Cleanup
        return () => {
            tl.kill();
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <>
            {/* Nav */}
            <nav className={styles.nav} ref={navRef}>
                <div className={styles.navLogo}>
                    <a href="#">HMTI</a>
                </div>
                <div className={styles.navLinks}>
                    <a href="#">Index</a>
                    <a href="#">Collection</a>
                    <a href="#">Projects</a>
                    <a href="#">Gallery</a>
                    <a href="#">Contact</a>
                </div>
            </nav>

            {/* Hero */}
            <section className={styles.hero} ref={sectionRef}>
                <div className={styles.heroBg} ref={heroBgRef}>
                    <video 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        onLoadedMetadata={(e) => {
                            const video = e.currentTarget;
                            video.currentTime = 3; // Mulai dari detik ke-5
                        }}
                    >
                        <source src="/hero-vid.webm" type="video/webm" />
                    </video>
                </div>

                <div className={styles.header} ref={headerRef}>
                    <h1>WELCOME</h1>
                </div>

                <div className={styles.heroFooter} ref={footerRef}>
                    <p>Religion</p>
                    <p>Science</p>
                    <p>Technology</p>
                </div>

                <div className={styles.progressBar} ref={progressBarRef}>
                    <div className={styles.progress} ref={progressRef}>...</div>
                </div>
            </section>
        </>
    );
}