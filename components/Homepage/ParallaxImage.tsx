"use client";
import Image from 'next/image';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const IMAGES_CONFIG = {
    top: [
        {
            src: '/parallaxgallery/picture8.webp',
            type: 'side',
            position: 'left-1/2'
        },
        {
            src: '/parallaxgallery/picture6.webp',
            type: 'side',
            position: 'right-1/2'
        },
    ],
    center: [
        {
            src: '/parallaxgallery/picture2.webp',
            type: 'side',
            position: 'right-full'
        },
        {
            src: '/parallaxgallery/picture1.webp',
            type: 'main',
            position: ''
        },
        {
            src: '/parallaxgallery/picture3.webp',
            type: 'side',
            position: 'left-full'
        },
    ],
    bottom: [
        {
            src: '/parallaxgallery/picture7.webp',
            type: 'side',
            position: 'left-1/2'
        },
        {
            src: '/parallaxgallery/picture5.webp',
            type: 'side',
            position: 'right-1/2'
        },
    ],
};

export default function ParallaxImage() {
    const stickyContainerRef = useRef<HTMLDivElement | null>(null);
    const text1Ref = useRef<HTMLParagraphElement | null>(null);
    const text2Ref = useRef<HTMLParagraphElement | null>(null);

    useGSAP(() => {
        const text1Element = text1Ref.current;
        const text2Element = text2Ref.current;
        if (!stickyContainerRef.current || !text1Element || !text2Element) return;

        const splitToSpans = (el: HTMLElement) => {
            const chars = el.textContent?.split('') || [];
            const spans = chars.map((char) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.display = 'inline-block';
                return span;
            });
            el.textContent = '';
            spans.forEach((span) => el.appendChild(span));
            return spans;
        };

        const text1Chars = splitToSpans(text1Element);
        const text2Chars = splitToSpans(text2Element);

        const isSmallScreen = window.matchMedia('(max-width: 640px)').matches;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: stickyContainerRef.current,
                start: 'top top',
                end: 'bottom bottom',
                scrub: isSmallScreen ? 0.35 : 0.5,
            }
        });
        tl.to('[data-scale]', {
            scale: 0.51,
            duration: 10,
        });
        tl.to('[data-zoom-type="side"], [data-zoom-type="main"]', {
            clipPath: 'inset(10px)',
            ease: "power4.out",
            duration: 10,
        }, 0);

        const textShift = -(window.innerHeight * (isSmallScreen ? 0.14 : 0.25));
        tl.to('[data-scale], [data-text-center]', {
            y: textShift,
            ease: "power1.in",
            duration: 10,
        }, 0);

        tl.from(text1Chars, {
            opacity: 0,
            stagger: 0.03,
            duration: 1,
        }, 0);
        tl.to(text1Chars, {
            opacity: 0,
            stagger: 0.03,
            duration: 1,
        }, '>0.3');
        tl.from(text2Chars, {
            opacity: 0,
            stagger: 0.03,
            duration: 1,
        }, '>0.3');
        tl.to(text2Chars, {
            opacity: 0,
            stagger: 0.03,
            duration: 1,
        }, '>0.3');
    }, { scope: stickyContainerRef });

    return (
        <section id="section-02" ref={stickyContainerRef} className="relative h-[260vh] sm:h-[320vh] lg:h-[400vh]">
            <div className="sticky top-0 h-svh overflow-hidden bg-white">
                <div data-scale className="relative h-svh w-screen will-change-transform bg-white">
                    <div data-section="top" className="absolute bottom-full h-svh w-screen">
                        {IMAGES_CONFIG.top.map((img, idx) => (
                            <div key={`top-${idx}`} className={`absolute aspect-video h-svh w-screen ${img.position}`}>
                                <Image
                                    data-zoom-type={img.type}
                                    src={img.src}
                                    alt="Image description"
                                    fill
                                    sizes="(max-width: 640px) 1080px, 100vw"
                                    className="object-cover"
                                    priority={false} />
                            </div>
                        ))}
                    </div>

                    <div data-section="center" >
                        {IMAGES_CONFIG.center.map((img, idx) => (
                            <div key={`center-${idx}`} className={`absolute aspect-video h-svh w-screen ${img.position}`}>
                                <Image
                                    data-zoom-type={img.type}
                                    src={img.src}
                                    alt="Image description"
                                    fill
                                    sizes="(max-width: 640px) 1080px, 100vw"
                                    className="object-cover"
                                    priority={img.type === "main"} />
                            </div>
                        ))}
                    </div>
                    <div data-section="bottom" className='absolute top-full h-svh w-screen'>
                        {IMAGES_CONFIG.bottom.map((img, idx) => (
                            <div key={`bottom-${idx}`} className={`absolute aspect-video h-svh w-screen ${img.position}`}>
                                <Image
                                    data-zoom-type={img.type}
                                    src={img.src}
                                    alt="Image description"
                                    fill
                                    sizes="(max-width: 640px) 1080px, 100vw"
                                    className="object-cover"
                                    priority={false} />
                            </div>
                        ))}
                    </div>
                </div>
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-8 bg-black/30"
                />
                <div
                    data-text-center
                    className="absolute top-1/2 left-1/2 w-[45vw] -translate-x-1/2 -translate-y-1/2 will-change-transform z-10 max-sm:top-[37%] max-sm:w-[88vw] max-sm:max-w-[28ch]"
                >
                    <p
                        ref={text1Ref}
                        data-text="1"
                        className="text absolute top-1/2 block w-full -translate-y-1/2 text-center"
                    >
                        Semua Berawal Dari Hal Kecil
                    </p>
                    <p
                        ref={text2Ref}
                        data-text="2"
                        className="text absolute top-1/2 block w-full -translate-y-1/2 text-center"
                        style={{ textWrap: 'balance' }}
                    >
                        Untuk Sesuatu <br/> Yang Besar
                    </p>
                </div>
            </div>
        </section>
    );
}
