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
            src: '/picture8.webp',
            type: 'side',
            position: 'left-1/2'
        },
        {
            src: '/picture6.webp',
            type: 'side',
            position: 'right-1/2'
        },
    ],
    center: [
        {
            src: '/picture2.webp',
            type: 'side',
            position: 'right-full'
        },
        {
            src: '/picture1.webp',
            type: 'main',
            position: ''
        },
        {
            src: '/picture3.webp',
            type: 'side',
            position: 'left-full'
        },
    ],
    bottom: [
        {
            src: '/picture7.webp',
            type: 'side',
            position: 'left-1/2'
        },
        {
            src: '/picture5.webp',
            type: 'side',
            position: 'right-1/2'
        },
    ],
};

export default function AboutSection() {
    const stickyContainerRef = useRef<HTMLDivElement | null>(null);

    useGSAP(() => {
        // Get text elements and split them into characters
        const text1Element = document.querySelector('[data-text="1"]');
        const text2Element = document.querySelector('[data-text="2"]');

        const text1Chars = text1Element?.textContent?.split('').map((char, i) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.display = 'inline-block';
            return span;
        }) || [];

        const text2Chars = text2Element?.textContent?.split('').map((char, i) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.display = 'inline-block';
            return span;
        }) || [];

        if (text1Element) {
            text1Element.textContent = '';
            text1Chars.forEach(span => text1Element.appendChild(span));
        }

        if (text2Element) {
            text2Element.textContent = '';
            text2Chars.forEach(span => text2Element.appendChild(span));
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: stickyContainerRef.current,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.5,
            }
        });
        tl.to('[data-scale]', {
            scale: 0.51,
            duration: 10,
        });
        tl.to('[data-zoom-type="side"], [data-zoom-type="main"]', {
            clipPath: 'inset(10px round 10px)',
            ease: "power4.out",
            duration: 10,
        }, 0);
        tl.to('[data-scale], [data-text-center]', {
            y: "-25vh",
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
        <section ref={stickyContainerRef} className="relative h-[400vh]">
            <div className="sticky top-0 h-screen overflow-hidden bg-white">
                <div data-scale className="relative h-screen w-screen will-change-transform bg-white">
                    <div data-section="top" className="absolute bottom-full h-screen w-screen">
                        {IMAGES_CONFIG.top.map((img, idx) => (
                            <div key={`top-${idx}`} className={`absolute aspect-video h-screen w-screen ${img.position}`}>
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
                            <div key={`center-${idx}`} className={`absolute aspect-video h-screen w-screen ${img.position}`}>
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
                    <div data-section="bottom" className='absolute top-full h-screen w-screen'>
                        {IMAGES_CONFIG.bottom.map((img, idx) => (
                            <div key={`bottom-${idx}`} className={`absolute aspect-video h-screen w-screen ${img.position}`}>
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
                <div data-text-center className='absolute top-1/2 left-1/2 w-[45vw] -translate-x-1/2 -translate-y-1/2 will-change-transform max-sm:w-[95vw] z-10'>
                    <p data-text="1" className="text absolute top-1/2 block w-full -translate-y-1/2 text-center font-medium text-gray-900" style={{ fontFamily: 'Bentham, serif' }}>Semua berawal dari hal kecil</p>
                    <p data-text="2" className="text absolute top-1/2 block w-full -translate-y-1/2 text-center font-medium text-gray-900" style={{ fontFamily: 'Bentham, serif', textWrap: 'balance' }}>Untuk sesuatu yang besar</p>
                </div>
            </div>
        </section>
    );
}
