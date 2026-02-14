'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './AboutContent.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function AboutContent() {
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
        const isMobile = window.matchMedia('(max-width: 768px)').matches;

        const pinDistance = isMobile ? window.innerHeight * 1.4 : window.innerHeight * 2;
        const minScale = isMobile ? 0.45 : window.innerWidth <= 1000 ? 0.3 : 0.1;
        const entryStart = isMobile ? 'top 92%' : 'top bottom';
        const entryEnd = isMobile ? 'top 20%' : 'top top';
        const topToMiddleDistance = header2Ref.current.offsetTop - header1Ref.current.offsetTop;
        const bottomToMiddleDistance = header3Ref.current.offsetTop - header2Ref.current.offsetTop;
        const mobileDriftDown = window.innerHeight * 0.12;

        headers.forEach((header, index) => {
            const initialX = index === 1 ? '-100%' : '100%';
            gsap.set(header, { x: initialX, y: 0, scale: 1, autoAlpha: 1 });
        });

        // Entry animation - slide in from sides
        const entryTrigger = ScrollTrigger.create({
            trigger: sectionRef.current,
            start: entryStart,
            end: entryEnd,
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
            end: `+=${pinDistance}`,
            pin: true,
            scrub: true,
            pinSpacing: false,
            onUpdate: (self) => {
                if (self.progress <= 0.5) {
                    const yProgress = self.progress / 0.5;

                    if (isMobile) {
                        gsap.set(headers[0], { x: '0%', y: topToMiddleDistance * yProgress, autoAlpha: 1, scale: 1 });
                        gsap.set(headers[1], { x: '0%', y: 0, autoAlpha: 1, scale: 1 });
                        gsap.set(headers[2], { x: '0%', y: -bottomToMiddleDistance * yProgress, autoAlpha: 1, scale: 1 });
                        return;
                    }

                    gsap.set(headers[0], { x: '0%', y: `${yProgress * 100}%` });
                    gsap.set(headers[1], { x: '0%' });
                    gsap.set(headers[2], { x: '0%', y: `${yProgress * -100}%` });
                } else {
                    const scaleProgress = (self.progress - 0.5) / 0.5;
                    const scale = 1 - scaleProgress * (1 - minScale);

                    if (isMobile) {
                        const driftDown = mobileDriftDown * scaleProgress;
                        gsap.set(headers[0], {
                            x: '0%',
                            y: topToMiddleDistance + driftDown,
                            scale,
                            autoAlpha: 1 - scaleProgress,
                        });
                        gsap.set(headers[1], {
                            x: '0%',
                            y: driftDown,
                            scale,
                            autoAlpha: 1,
                        });
                        gsap.set(headers[2], {
                            x: '0%',
                            y: -bottomToMiddleDistance + driftDown,
                            scale,
                            autoAlpha: 1 - scaleProgress,
                        });
                        return;
                    }

                    gsap.set(headers[0], { x: '0%', y: '100%' });
                    gsap.set(headers[2], { x: '0%', y: '-100%' });
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
                <div className={styles.textContainer}>
                    <h1 ref={textRef} className={styles.animateText}>
                        Lahirnya HMTI pada tahun 2025 adalah puncak dari perjalanan panjang sejak 2023.
                        Kami mendirikan rumah ini dengan satu kesadaran: mahasiswa TI datang dari latar belakang
                        yang beragam. Kami menolak elitisme teknologi. Kami percaya setiap mahasiswa TI Antasari
                        memiliki timeline sukses masing-masing.
                    </h1>
                    <h1 ref={text2Ref} className={styles.animateText}>
                        Visi kami sederhana: "No One Left Behind." HMTI hadir untuk merangkul semua.
                        Bagi yang sudah berlari cepat, kami sediakan ruang untuk berinovasi.
                        Bagi yang masih merangkak, kami sediakan tangan untuk menuntun.
                        Kami mengubah kompetisi yang toxic menjadi kolaborasi yang saling menguatkan.
                        Kami bukan sekadar himpunan penyelenggara acara, kami adalah support system.
                        Di sini, rasa takut salah dan rasa tidak percaya diri kami ganti dengan budaya
                        peer learning yang saling menguatkan. Di dunia teknologi yang luas ini, sukses
                        sendirian itu biasa, tetapi maju bersama adalah tujuan utama.
                    </h1>
                </div>
            </section>

            {/* section baru jika diperlukan */}
            {/* <section className={`${styles.servicesCopy} ${styles.servicesCopySecond}`}>
                <h1 ref={text3Ref} className={styles.animateText}>
                    Tujuan HMTI dibangun adalah sebagai jembatan profesional dan akademik, menyatukan potensi mahasiswa TI untuk bersaing secara kompeten di era disrupsi teknologi.
                </h1>
            </section> */}
        </>
    );
}
