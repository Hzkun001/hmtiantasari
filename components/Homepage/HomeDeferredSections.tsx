'use client';

import dynamic from 'next/dynamic';

const AboutSection = dynamic(() => import('@/components/Homepage/ParallaxImage'), { ssr: false });
const CalendarSection = dynamic(() => import('@/components/Homepage/CalenderSection'), { ssr: false });
const NewsSection = dynamic(() => import('@/components/Homepage/NewsSection'), { ssr: false });
const SliderNavigation = dynamic(() => import('@/components/Homepage/SliderNavigation'), { ssr: false });
import ChatWidget from '@/components/ChatBot/ChatWidget'

export default function HomeDeferredSections() {
    return (
        <>
            <ChatWidget />
            <AboutSection />
            <CalendarSection />
            <NewsSection />
            <SliderNavigation />
        </>
    );
}
