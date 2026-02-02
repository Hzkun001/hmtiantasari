'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ServicesContent.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function ServicesContent() {
    const sectionRef = useRef<HTMLElement>(null);
    const header1Ref = useRef<HTMLDivElement>(null);
    const header2Ref = useRef<HTMLDivElement>(null);
    const header3Ref = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const text2Ref = useRef<HTMLHeadingElement>(null);
    const text3Ref = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !header1Ref.current || !header2Ref.current || !header3Ref.current) return;

        const headers = [header1Ref.current, header2Ref.current, header3Ref.current];

        // Entry animation - slide in from sides
        const entryTrigger = ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
            onUpdate: (self) => {
                gsap.set(headers[0], { x: `${100 - self.progress * 100}%` });
                gsap.set(headers[1], { x: `${-100 + self.progress * 100}%` });
                gsap.set(headers[2], { x: `${100 - self.progress * 100}%` });
            },
        });

        // Pinned animations - vertical movement and scale
        const pinnedTrigger = ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top top',
            end: `+=${window.innerHeight * 2}`,
            pin: true,
            scrub: true,
            pinSpacing: false,
            onUpdate: (self) => {
                if (self.progress <= 0.5) {
                    const yProgress = self.progress / 0.5;
                    gsap.set(headers[0], { x: '0%', y: `${yProgress * 100}%` });
                    gsap.set(headers[1], { x: '0%' });
                    gsap.set(headers[2], { x: '0%', y: `${yProgress * -100}%` });
                } else {
                    gsap.set(headers[0], { x: '0%', y: '100%' });
                    gsap.set(headers[2], { x: '0%', y: '-100%' });

                    const scaleProgress = (self.progress - 0.5) / 0.5;
                    const minScale = window.innerWidth <= 1000 ? 0.3 : 0.1;
                    const scale = 1 - scaleProgress * (1 - minScale);

                    headers.forEach((header) => gsap.set(header, { scale }));
                }
            },
        });

        return () => {
            entryTrigger.kill();
            pinnedTrigger.kill();
        };
    }, []);

    useEffect(() => {
        const textElements = [textRef.current, text2Ref.current, text3Ref.current];
        const triggers: ScrollTrigger[] = [];

        textElements.forEach((textElement) => {
            if (!textElement) return;

            textElement.setAttribute('data-text', textElement.textContent?.trim() || '');

            const trigger = ScrollTrigger.create({
                trigger: textElement,
                start: 'top 50%',
                end: 'bottom 50%',
                scrub: 1,
                onUpdate: (self) => {
                    const clipValue = Math.max(0, 100 - self.progress * 100);
                    textElement.style.setProperty('--clip-value', `${clipValue}%`);
                },
            });

            triggers.push(trigger);
        });

        return () => {
            triggers.forEach(trigger => trigger.kill());
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <section ref={sectionRef} className={styles.services}>
                <div ref={header1Ref} className={`${styles.servicesHeader} ${styles.header1}`}>
                    <Image src="/images/HMTI.svg" alt="HMTI" width={800} height={200} />
                </div>
                <div ref={header2Ref} className={`${styles.servicesHeader} ${styles.header2}`}>
                    <Image src="/images/HMTI.svg" alt="HMTI" width={800} height={200} />
                </div>
                <div ref={header3Ref} className={`${styles.servicesHeader} ${styles.header3}`}>
                    <Image src="/images/HMTI.svg" alt="HMTI" width={800} height={200} />
                </div>
            </section>

            <section className={styles.servicesCopy}>
                <h1 ref={textRef} className={styles.animateText}>
                    Lahirnya HMTI di tahun 2025 adalah manifestasi dari rancangan strategis yang disusun oleh mahasiswa sejak tahun 2023. Kami hadir dengan visi yang jelas.
                </h1>
            </section>

            <section className={`${styles.servicesCopy} ${styles.servicesCopySecond}`}>
                <h1 ref={text3Ref} className={styles.animateText}>
                    Tujuan HMTI dibangun adalah sebagai jembatan profesional dan akademik, menyatukan potensi mahasiswa TI untuk bersaing secara kompeten di era disrupsi teknologi.
                </h1>
            </section>
        </>
    );
}
