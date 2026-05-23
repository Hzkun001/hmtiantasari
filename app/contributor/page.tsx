import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
// @ts-ignore: Allow importing CSS as a side-effect in this Next.js page
import './contributor.css';

const contributors = [
    {
        name: 'RISTEK HMTI 2025',
        label: 'Contributor 01',
        role: 'Pengonsep dan Pembuatan Website HMTI.',
    },
    {
        name: 'M Raihan Azmi',
        label: 'Contributor 02',
        role: 'Mahasiswa TI angkatan 23. Design dan Wireframe pengembangan website HMTI.',
    },
    {   
        name: 'RISTEK HMTI 2026',
        label: 'Contributor 03',
        role: 'Pengembangan dan pemeliharaan ekosistem digital HMTI.',
    }

] as const;

export const metadata: Metadata = {
    title: 'Contributor',
    description: 'Daftar kontributor pengembangan website HMTI UIN Antasari.',
};

export default function ContributorPage() {
    return (
        <main className="contributor-page">
            <Header />
            <section className="contributor-hero" aria-labelledby="contributor-heading">
                <div className="contributor-shell">
                    <div className="contributor-kicker">Credits / Website HMTI</div>
                    <div className="contributor-heading-row">
                        <h1 id="contributor-heading">Contributor</h1>
                        <p>
                            Apresiasi untuk pihak yang berkontribusi dalam pengembangan, perawatan, dan penguatan
                            identitas digital HMTI.
                        </p>
                    </div>

                    <div className="contributor-stage" aria-label="Daftar contributor">
                        <span className="contributor-stage-orbit" aria-hidden="true" />
                        {contributors.map((contributor, index) => (
                            <article
                                className={`contributor-credit contributor-credit-${index + 1}`}
                                key={contributor.name}
                            >
                                <span className="contributor-credit-count">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <div className="contributor-credit-copy">
                                    <span className="contributor-credit-label">{contributor.label}</span>
                                    <h2>{contributor.name}</h2>
                                    <p>{contributor.role}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
