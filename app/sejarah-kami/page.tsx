import HeroAboutOutro from '@/components/HeroAboutOutro/HeroAboutOutro';
import Nav from '@/components/Nav/Nav';
import ServicesContent from '@/components/ServicesContent/ServicesContent';
import VideoGallery from '@/components/VideoGallery/VideoGallery';
import './sejarah-kami.css';

export default function SejarahKamiPage() {
    return (
        <main className="sejarah-kami-page">
            <Nav />
            <VideoGallery />
            <HeroAboutOutro />
            <ServicesContent />
        </main>
    );
}
