'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './HeroAboutOutro.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function HeroAboutOutro() {
    const aboutTextRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (!aboutTextRef.current) return;

        const textElement = aboutTextRef.current;
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

        return () => {
            trigger.kill();
        };
    }, []);

    return (
        <>
            <section className={styles.hero}>
                <div className={styles.heroImg}>
                    <Image src="/images/pakMunsyi.jpg" alt="hero" fill priority />
                </div>
            </section>

            <section className={styles.about}>
                <h1 ref={aboutTextRef} className={styles.animateText}>
                Bapak Munsyi adalah tokoh utama berdirinya Teknologi Informasi. Tahun 2023 menandai babak baru di UIN Antasari dengan lahirnya program studi Teknologi Informasi.
                </h1>
            </section>

            <section className={styles.outro}>
                <div className={styles.outroImgContainer}>
                    <div className={styles.outroWrapper}>
                        <div className={styles.outroImg}>
                            <Image src="/images/ketum.jpg" alt="ketum" fill />
                        </div>
                        <p className={styles.outroCaption}>Ketua Umum 2025-2026</p>
                    </div>
                    <div className={styles.outroWrapper}>
                        <div className={styles.outroImg}>
                            <Image src="/images/waketum.jpg" alt="waketum" fill />
                        </div>
                        <p className={styles.outroCaption}>Wakil Ketua Umum 2025-2026</p>
                    </div>
                </div>
            </section>
        </>
    );
}
