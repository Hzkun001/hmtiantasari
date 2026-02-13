'use client';

import dynamic from 'next/dynamic';

const HeroReveal = dynamic(() => import('@/components/Homepage/WelcomeVideo'), { ssr: false });
const AboutSection = dynamic(() => import('@/components/Homepage/ParallaxImage'), { ssr: false });
const CalendarSection = dynamic(() => import('@/components/Homepage/CalenderSection'), { ssr: false });
const NewsSection = dynamic(() => import('@/components/Homepage/NewsSection'), { ssr: false });
const SliderNavigation = dynamic(() => import('@/components/Homepage/SliderNavigation'), { ssr: false });

export default function HomeDeferredSections() {
    return (
        <>
            <HeroReveal />
            <AboutSection />
            <CalendarSection />
            <NewsSection />
            <SliderNavigation />
        </>
    );
}
