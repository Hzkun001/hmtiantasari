import HeroSection from '@/components/Homepage/HeroSection';
import CalendarSection from '@/components/Homepage/CalenderSection';
import NewsSection from '@/components/Homepage/NewsSection';
import ParallaxImage from '@/components/Homepage/ParallaxImage';
import SliderNavigation from '@/components/Homepage/SliderNavigation';
import ChatWidget from '@/components/ChatBot/ChatWidget';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
    return (
        <main>
            <Header />
            <HeroSection />
            <ChatWidget />
            <ParallaxImage />
            <CalendarSection />
            <NewsSection />
            <SliderNavigation />
            <Footer />
        </main>
    );
}
