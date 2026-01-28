import HeroSection from '@/components/sections/HeroSection';
import ContentSection from '@/components/sections/ContentSection';
import SliderNavigation from '@/components/sections/SliderNavigation';
import HeroReveal from '@/components/sections/HeroReveal';

export default function HomePage() {
    return (
        <main>
            <HeroSection />
            <HeroReveal />
            <ContentSection />
            <SliderNavigation />
        </main>
    );
}
