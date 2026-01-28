'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface ContentCardProps {
    id: string;
    counter: string;
    subtitle: string;
    title?: { line1: string; line2: string };
    description: string;
    image: string;
}

function ContentCard({ id, counter, subtitle, title, description, image }: ContentCardProps) {
    const rowRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const counterRef = useRef<HTMLSpanElement>(null);
    const subtitleRef = useRef<HTMLHeadingElement>(null);
    const titleSpansRef = useRef<HTMLSpanElement[]>([]);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const actionRef = useRef<HTMLAnchorElement>(null);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        if (prefersReducedMotion || !rowRef.current) return;

        const ctx = gsap.context(() => {
            const textElements = [
                subtitleRef.current,
                ...titleSpansRef.current.filter(Boolean),
                descriptionRef.current,
                actionRef.current,
            ].filter(Boolean);

            gsap.timeline({
                scrollTrigger: {
                    trigger: rowRef.current,
                    start: 'center-=100 center',
                    end: 'center top',
                    scrub: 0.2,
                    pin: rowRef.current,
                    invalidateOnRefresh: true,
                },
            })
                .fromTo(
                    textElements,
                    { autoAlpha: 0, y: 100 },
                    { autoAlpha: 1, y: 0, stagger: 0.2 },
                    '0'
                )
                .fromTo(
                    counterRef.current,
                    { autoAlpha: 0 },
                    { autoAlpha: 1 },
                    '0'
                )
                .fromTo(
                    imageRef.current,
                    { autoAlpha: 0, scale: 1.5 },
                    { autoAlpha: 1, scale: 1 },
                    '0'
                );
        });

        return () => ctx.revert();
    }, [prefersReducedMotion]);

    return (
        <div className="content-wrapper" id={id}>
            <div ref={rowRef} className="content-row">
                <div className="content-image">
                    <img ref={imageRef} src={image} alt={subtitle} />
                </div>
                <div className="content-content">
                    <h5 ref={subtitleRef} className="content-subtitle">
                        <span ref={counterRef} className="counter">{counter}</span>
                        {subtitle}
                    </h5>
                    {title && (
                        <h2 className="content-title">
                            <span ref={(el) => {
                                if (el) titleSpansRef.current[0] = el;
                            }}>{title.line1}</span>
                            <span ref={(el) => {
                                if (el) titleSpansRef.current[1] = el;
                            }}>{title.line2}</span>
                        </h2>
                    )}
                    <p ref={descriptionRef} className="content-copy">
                        {description}
                    </p>
                    <a ref={actionRef} href="#" className="content-action">
                        read more
                        <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M16 -6.99382e-07L14.59 1.41L20.17 7L-3.93402e-07 7L-3.0598e-07 9L20.17 9L14.58 14.58L16 16L24 8L16 -6.99382e-07Z"
                                fill="#FBD784"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function ContentSection() {
    const contentData: ContentCardProps[] = [
        {
            id: 'section-01',
            counter: '01',
            subtitle: 'GEt Started',
            description: 'Determining what level of hiker you are can be an important tool when planning future hikes. This hiking level guide will help you plan hikes according to different hike ratings set by various websites like All Trails and Modern Hiker. What type of hiker are you – novice, moderate, advanced moderate, expert, or expert backpacker?',
            image: '/step-1.png',
        },
        {
            id: 'section-02',
            counter: '02',
            subtitle: 'Hiking Essentials',
            title: { line1: 'Picking the right', line2: 'Hiking Gear!' },
            description: 'Determining what level of hiker you are can be an important tool when planning future hikes. This hiking level guide will help you plan hikes according to different hike ratings set by various websites like All Trails and Modern Hiker. What type of hiker are you – novice, moderate, advanced moderate, expert, or expert backpacker?',
            image: '/step-2.png',
        },
        {
            id: 'section-03',
            counter: '03',
            subtitle: 'where you go is the key',
            title: { line1: 'Understand Your', line2: 'Map & Timing' },
            description: 'Determining what level of hiker you are can be an important tool when planning future hikes. This hiking level guide will help you plan hikes according to different hike ratings set by various websites like All Trails and Modern Hiker. What type of hiker are you – novice, moderate, advanced moderate, expert, or expert backpacker?',
            image: '/step-3.png',
        },
    ];

    return (
        <section className="content-section section">
            <div className="container">
                {contentData.map((content) => (
                    <ContentCard key={content.id} {...content} />
                ))}
            </div>
        </section>
    );
}
