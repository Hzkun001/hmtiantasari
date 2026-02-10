import AboutOpening from '@/components/About/AboutOpening/AboutOpening';
import AboutContent from '@/components/About/AboutContent/AboutContent';
import VideoGallery from '@/components/About/HeroGallery/HeroGallery';
import './sejarah-kami.css';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

const VISION_STATEMENT =
    'Menjadikan sentra berhimpun mahasiswa TI sebagai dinamisator kolaborasi dan aksi transformatif yang berlandaskan nilai-nilai Islami.';

const VISION_PILLARS = [
    {
        title: 'Sentra Berhimpun',
        description:
            'Himpunan menjadi ruang yang menyatukan potensi mahasiswa untuk tumbuh bersama serta mengembangkan kapasitas diri.',
    },
    {
        title: 'Dinamisator Kolaborasi',
        description:
            'Mendorong kolaborasi yang produktif dan inklusif untuk membangun ekosistem inovatif serta membuka ruang pengembangan baru.',
    },
    {
        title: 'Aksi Transformatif',
        description:
            'Menggerakkan mahasiswa agar proaktif dan inovatif dalam menjawab tantangan sehingga menghasilkan dampak nyata.',
    },
    {
        title: 'Nilai Islami',
        description:
            'Nilai Islami menjadi kompas etika dan moral dalam setiap aktivitas organisasi serta interaksi antaranggota.',
    },
];

const MISSIONS = [
    {
        title: 'Sentra Kolaborasi yang Dinamis',
        description:
            'Menyelenggarakan forum diskusi, proyek bersama, dan kegiatan inovatif lintas mahasiswa TI agar potensi individu terhubung menjadi sinergi pencapaian bersama.',
    },
    {
        title: 'Organisasi yang Berkomitmen dan Berintegritas',
        description:
            'Membangun budaya profesional melalui penguatan kepemimpinan, tata kelola transparan, dan evaluasi berkelanjutan agar organisasi berjalan efektif serta kokoh.',
    },
    {
        title: 'Nilai Islami sebagai Landasan Gerak',
        description:
            'Menginternalisasikan nilai-nilai Islami sebagai fondasi spiritual dan moral untuk menghadirkan lingkungan himpunan yang harmonis, etis, dan bertanggung jawab.',
    },
    {
        title: 'Ekosistem Pembelajaran Kolaboratif',
        description:
            'Menjalankan mentoring terstruktur serta pengembangan soft skills dan hard skills untuk mendorong pertumbuhan akademik dan profesional anggota secara berkelanjutan.',
    },
    {
        title: 'Jejaring Kemitraan Strategis',
        description:
            'Memperluas kemitraan internal dan eksternal bersama institusi, perusahaan, serta komunitas melalui kolaborasi program yang membuka peluang penguatan kapasitas.',
    },
];

export default function SejarahKamiPage() {
    return (
        <main className="sejarah-kami-page">
            <VideoGallery />
            <Header showAfterSelector="[data-history-hero-gallery]" />
            <AboutOpening />
            <AboutContent />
            <section id="timeline" className="sejarah-kami-section sejarah-kami-section--mono" aria-label="Visi Kabinet Arnanta">
                <div className="container sejarah-kami-container">
                    <div className="sejarah-kami-manifesto">
                        <p className="sejarah-kami-mono-label">Kabinet Arnanta</p>
                        <h2 className="sejarah-kami-section-title">Visi Gerak Himpunan</h2>
                        <blockquote className="sejarah-kami-manifesto-quote">
                            <p>{VISION_STATEMENT}</p>
                        </blockquote>
                    </div>

                    <div className="sejarah-kami-pillar-layout">
                        <div className="sejarah-kami-pillar-intro">
                            <h3>Empat poros utama</h3>
                            <p>
                                Empat poros ini menjelaskan cara kabinet bergerak: menyatukan mahasiswa, menguatkan kolaborasi,
                                mendorong perubahan, dan menjaga arah etis.
                            </p>
                        </div>
                        <ol className="sejarah-kami-pillar-list">
                            {VISION_PILLARS.map((pillar, index) => (
                                <li key={pillar.title} className="sejarah-kami-pillar-row">
                                    <span className="sejarah-kami-item-index">{String(index + 1).padStart(2, '0')}</span>
                                    <h4>{pillar.title}</h4>
                                    <p>{pillar.description}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </section>

            <section id="nilai" className="sejarah-kami-section sejarah-kami-section--mono" aria-label="Misi Kabinet">
                <div className="container sejarah-kami-container">
                    <div className="sejarah-kami-mission-heading">
                        <h2 className="sejarah-kami-section-title">Misi Strategis Kabinet</h2>
                        <p className="sejarah-kami-section-subtitle">
                            Lima langkah fokus untuk membangun himpunan yang kolaboratif, berintegritas, dan bertumbuh
                            bersama.
                        </p>
                    </div>

                    <ol className="sejarah-kami-mission-rail">
                        {MISSIONS.map((mission, index) => (
                            <li key={mission.title} className="sejarah-kami-mission-row">
                                <span className="sejarah-kami-item-index">{String(index + 1).padStart(2, '0')}</span>
                                <h3>{mission.title}</h3>
                                <p>{mission.description}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
            <Footer />
        </main>
    );
}
