'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './AboutOpening.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function AboutOpening() {
    const aboutTextRef1 = useRef<HTMLHeadingElement>(null);
    const aboutTextRef2 = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const refs = [aboutTextRef1, aboutTextRef2];
        const triggers: ScrollTrigger[] = [];

        refs.forEach((ref) => {
            if (!ref.current) return;

            const textElement = ref.current;
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
            <section className={styles.hero}>
                <div className={styles.heroImg}>
                    <Image src="/images/pak-munsyi.png" alt="hero" fill priority />
                </div>
            </section>

            <section className={styles.about}>
                <div className={styles.textContainer}>
                    <h1 ref={aboutTextRef1} className={styles.animateText}>
                        Di balik berdirinya Teknologi Informasi UIN Antasari, terdapat sebuah inisiatif teknis yang dipimpin oleh Bapak Munsyi. Beliau adalah tokoh utama berdirinya Teknologi Informasi. Beliau melihat ketimpangan di talenta muda sekarang minimnya wadah akademik yang menggabungkan etika religius dengan kompetensi teknis tingkat lanjut.
                    </h1>
                    <h1 ref={aboutTextRef2} className={styles.animateText}>
                        Tahun 2023 adalah hasil dari kompilasi usaha panjang tersebut. Berdirinya jurusan ini adalah bukti dedikasi beliau untuk memastikan UIN Antasari tidak tertinggal dalam disrupsi teknologi.
                    </h1>
                </div>
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
