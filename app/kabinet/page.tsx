'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase, TeamMember as DbTeamMember } from '@/lib/supabase';
import './kabinet.css';
import KabinetLanding from '@/components/Kabinet/KabinetLanding';

type TeamKey = 'BPH' | 'BDK' | 'HUKES' | 'KEMHAS' | 'KEWISHAN' | 'RISTEK';

type MemberCard = {
    id: number;
    name: string;
    role: string;
    image?: string;
};

type DivisionTeam = {
    key: Exclude<TeamKey, 'BPH'>;
    name: string;
    description: string;
    kabinetTitle: string;
    jobdesk: string[];
};

type LenisLike = {
    scrollTo?: (
        target: number | string | HTMLElement,
        options?: {
            immediate?: boolean;
            force?: boolean;
        }
    ) => void;
};

const DIVISION_TEAMS: DivisionTeam[] = [
    {
        key: 'BDK',
        name: 'BDK',
        description: 'Tim publikasi visual, dokumentasi, dan penguatan identitas media organisasi.',
        kabinetTitle: 'Branding Digital Kreatif',
        jobdesk: [
            'Menyusun konsep desain publikasi dan kebutuhan visual kegiatan.',
            'Mengelola dokumentasi foto/video kegiatan internal dan eksternal.',
            'Menjaga konsistensi branding media sosial dan aset digital himpunan.',
        ],
    },
    {
        key: 'HUKES',
        name: 'HUKES',
        description: 'Tim relasi eksternal, komunikasi kelembagaan, serta kolaborasi lintas organisasi.',
        kabinetTitle: 'Hubungan dan Kerjasama',
        jobdesk: [
            'Membangun komunikasi dan kemitraan dengan organisasi eksternal.',
            'Mengelola kanal informasi resmi untuk komunikasi publik.',
            'Menyiapkan protokol hubungan kelembagaan pada kegiatan kolaboratif.',
        ],
    },
    {
        key: 'KEMHAS',
        name: 'KEMHAS',
        description: 'Tim pembinaan anggota, kaderisasi, serta aktivasi program mahasiswa internal.',
        kabinetTitle: 'Kemasyarakatan',
        jobdesk: [
            'Menyusun pola kaderisasi dan monitoring perkembangan anggota.',
            'Mengelola program pembinaan soft skill serta budaya organisasi.',
            'Mengaktifkan partisipasi anggota pada program kerja himpunan.',
        ],
    },
    {
        key: 'KEWISHAN',
        name: 'KEWISHAN',
        description: 'Tim pengembangan usaha, unit bisnis mahasiswa, dan inovasi program ekonomi kreatif.',
        kabinetTitle: 'Kewirausahawan',
        jobdesk: [
            'Merancang produk dan program kewirausahaan berbasis mahasiswa.',
            'Mengelola operasional unit usaha dan evaluasi performa bisnis.',
            'Mendorong inovasi program ekonomi kreatif untuk pendanaan himpunan.',
        ],
    },
    {
        key: 'RISTEK',
        name: 'RISTEK',
        description: 'Tim pengembangan teknologi, kelas teknis, dan proyek berbasis riset mahasiswa.',
        kabinetTitle: 'Riset dan Teknologi',
        jobdesk: [
            'Menyusun agenda kelas teknis, mentoring, dan peningkatan skill anggota.',
            'Menginisiasi mini project serta riset terapan berbasis kebutuhan nyata.',
            'Mengelola dokumentasi output teknologi sebagai portofolio divisi.',
        ],
    },
];

const JOBDESK = [
    {
        title: 'Koordinasi Internal',
        text: 'Merapikan ritme kerja kabinet, mulai dari agenda rapat, eksekusi program, hingga evaluasi rutin.',
    },
    {
        title: 'Administrasi & Keuangan',
        text: 'Menjaga ketertiban dokumen, legalitas kegiatan, serta pengelolaan kas yang terukur dan terbuka.',
    },
    {
        title: 'Pengembangan Anggota',
        text: 'Menyediakan ruang belajar yang terarah untuk meningkatkan soft skill dan hard skill anggota.',
    },
    {
        title: 'Kolaborasi Eksternal',
        text: 'Membangun jaringan dengan komunitas, organisasi mahasiswa, dan pihak mitra untuk proyek bersama.',
    },
];

const BPH_KABINET_TITLE = 'Badan Pengurus Harian';

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase()).join('');
}

function normalizeText(value?: string | null) {
    return (value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function hasKeyword(value: string, keywords: string[]) {
    return keywords.some((keyword) => value.includes(keyword));
}

function resolveMemberImage(image?: string) {
    if (!image) return '';
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:') || image.startsWith('/')) {
        return image;
    }

    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!baseUrl) return image;

    const cleanedPath = image.replace(/^\/+/, '');
    return `${baseUrl}/storage/v1/object/public/team-images/${cleanedPath}`;
}

function inferTeamKey(member: DbTeamMember): TeamKey {
    const fromDepartment = normalizeText(member.department);
    if (hasKeyword(fromDepartment, ['BPH'])) return 'BPH';
    if (hasKeyword(fromDepartment, ['BDK', 'DIGIKRAF', 'DIGITALKREATIF', 'BADANDIGITALKREATIF'])) return 'BDK';
    if (hasKeyword(fromDepartment, ['HUKES', 'HUBUNGANKEMASYARAKATAN', 'HUMAS'])) return 'HUKES';
    if (hasKeyword(fromDepartment, ['KEMHAS', 'KEMAHASISWAAN'])) return 'KEMHAS';
    if (hasKeyword(fromDepartment, ['KEWISHAN', 'KEWIRAUSAHAAN'])) return 'KEWISHAN';
    if (hasKeyword(fromDepartment, ['RISTEK', 'RISETDANTEKNOLOGI', 'RISETTEKNOLOGI'])) return 'RISTEK';

    const fromRoleAndBio = normalizeText(`${member.role ?? ''} ${member.bio ?? ''}`);
    if (hasKeyword(fromRoleAndBio, ['KETUAHIMPUNAN', 'WAKILKETUAHIMPUNAN', 'SEKRETARIS', 'BENDAHARA'])) return 'BPH';
    if (hasKeyword(fromRoleAndBio, ['DIGIKRAF', 'BDK', 'DIGITALKREATIF'])) return 'BDK';
    if (hasKeyword(fromRoleAndBio, ['HUKES', 'HUBUNGANKEMASYARAKATAN', 'HUMAS'])) return 'HUKES';
    if (hasKeyword(fromRoleAndBio, ['KEMHAS', 'KEMAHASISWAAN'])) return 'KEMHAS';
    if (hasKeyword(fromRoleAndBio, ['KEWISHAN', 'KEWIRAUSAHAAN'])) return 'KEWISHAN';
    if (hasKeyword(fromRoleAndBio, ['RISTEK', 'RISETDANTEKNOLOGI', 'RISETTEKNOLOGI'])) return 'RISTEK';

    return 'BPH';
}

function TeamMemberCard({ member }: { member: MemberCard }) {
    const [imageFailed, setImageFailed] = useState(false);
    const imageSrc = resolveMemberImage(member.image);

    useEffect(() => {
        setImageFailed(false);
    }, [member.image]);

    return (
        <article className="kabinet-core-card">
            <div className="kabinet-core-id-card">
                <Image
                    src="/images/team-member-frame.svg"
                    alt=""
                    aria-hidden="true"
                    width={162}
                    height={241}
                    className="kabinet-core-frame"
                />
                <div className="kabinet-core-photo-wrap">
                    {imageSrc && !imageFailed ? (
                        <Image
                            src={imageSrc}
                            alt={member.name}
                            width={300}
                            height={380}
                            className="kabinet-core-photo"
                            sizes="(max-width: 768px) 50vw, 25vw"
                            onError={() => setImageFailed(true)}
                            draggable={false}
                            onDragStart={(event) => event.preventDefault()}
                            unoptimized
                        />
                    ) : (
                        <div className="kabinet-core-fallback" aria-hidden="true">
                            {getInitials(member.name)}
                        </div>
                    )}
                </div>
                <div className="kabinet-core-name-wrap">
                    <p className="kabinet-core-name">{member.name}</p>
                </div>
            </div>

            <div className="kabinet-core-meta">
                <p className="kabinet-core-role">{member.role}</p>
            </div>
        </article>
    );
}

function DraggableCardRow({
    className,
    children,
}: {
    className: string;
    children: ReactNode;
}) {
    const rowRef = useRef<HTMLDivElement | null>(null);
    const dragStateRef = useRef({
        isDragging: false,
        startX: 0,
        startScrollLeft: 0,
        hasMoved: false,
    });

    const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
        if (event.button !== 0) return;

        const row = rowRef.current;
        if (!row) return;

        dragStateRef.current.isDragging = true;
        dragStateRef.current.startX = event.pageX;
        dragStateRef.current.startScrollLeft = row.scrollLeft;
        dragStateRef.current.hasMoved = false;
        row.classList.add('is-dragging');
    };

    const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
        if (!dragStateRef.current.isDragging) return;

        event.preventDefault();

        const row = rowRef.current;
        if (!row) return;

        const delta = event.pageX - dragStateRef.current.startX;
        if (Math.abs(delta) > 3) {
            dragStateRef.current.hasMoved = true;
        }

        row.scrollLeft = dragStateRef.current.startScrollLeft - delta;
    };

    const stopDragging = () => {
        if (!dragStateRef.current.isDragging) return;

        dragStateRef.current.isDragging = false;
        rowRef.current?.classList.remove('is-dragging');
    };

    const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
        if (!dragStateRef.current.hasMoved) return;

        event.preventDefault();
        event.stopPropagation();
        dragStateRef.current.hasMoved = false;
    };

    return (
        <div
            ref={rowRef}
            className={`${className} kabinet-draggable-row`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
            onClickCapture={handleClickCapture}
        >
            {children}
        </div>
    );
}

export default function KabinetPage() {
    const [members, setMembers] = useState<DbTeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const lenis = (window as Window & { lenis?: LenisLike }).lenis;
        lenis?.scrollTo?.(0, { immediate: true, force: true });
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, []);

    useEffect(() => {
        let mounted = true;

        async function fetchMembers() {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('TeamMembers')
                .select('*')
                .order('created_at', { ascending: true });

            if (!mounted) return;

            if (fetchError) {
                console.error('Error fetching team members for kabinet page:', fetchError);
                setError('Gagal memuat data tim dari dashboard admin.');
                setMembers([]);
            } else {
                setError(null);
                setMembers(data ?? []);
            }

            setLoading(false);
        }

        fetchMembers();

        return () => {
            mounted = false;
        };
    }, []);

    const groupedMembers = useMemo(() => {
        const grouped: Record<TeamKey, MemberCard[]> = {
            BPH: [],
            BDK: [],
            HUKES: [],
            KEMHAS: [],
            KEWISHAN: [],
            RISTEK: [],
        };

        for (const member of members) {
            const key = inferTeamKey(member);
            grouped[key].push({
                id: member.id,
                name: member.name,
                role: member.role,
                image: member.image_url,
            });
        }

        return grouped;
    }, [members]);

    return (
        <main className="kabinet-page">
            <Header onlyShowAtTop theme="light" />
            <div className="kabinet-shell kabinet-shell--landing">
                <KabinetLanding />
            </div>

            <section className="kabinet-shell kabinet-section" aria-label="Profil tim inti">
                <div className="kabinet-section-header">
                    <h2>Profil Tim Inti</h2>
                    <p>Struktur inti yang memastikan arah kabinet berjalan selaras dengan visi organisasi.</p>
                </div>

                <div className="kabinet-division-team-title-wrap">
                    <p className="kabinet-division-team-title-label">Kabinet Title</p>
                    <p className="kabinet-division-team-title">{BPH_KABINET_TITLE}</p>
                </div>


                {loading ? (
                    <p className="kabinet-team-state">Memuat data tim inti...</p>
                ) : groupedMembers.BPH.length > 0 ? (
                    <DraggableCardRow className="kabinet-core-grid">
                        {groupedMembers.BPH.map((member) => (
                            <TeamMemberCard key={member.id} member={member} />
                        ))}
                    </DraggableCardRow>
                ) : (
                    <p className="kabinet-team-state">Belum ada anggota BPH. Tambahkan dari dashboard admin.</p>
                )}

                <div className="kabinet-division-team-info">
                    <p className="kabinet-division-team-jobdesk-label">Kabinet Jobdesk</p>
                    <ul className="kabinet-division-team-jobdesk">
                        {JOBDESK.map((item) => (
                            <li key={item.title}>
                                <strong>{item.title}</strong>: {item.text}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="kabinet-shell kabinet-section" aria-label="Profil departemen">
                <div className="kabinet-section-header">
                    <h2>Profil Departemen</h2>
                </div>

                <div className="kabinet-division-team-list">
                    {DIVISION_TEAMS.map((division) => (
                        <article key={division.name} className="kabinet-division-team-block">
                            <div className="kabinet-division-team-head">
                                <h3>{division.name}</h3>
                                <p>{division.description}</p>
                            </div>
                            <div className="kabinet-division-team-title-wrap">
                                <p className="kabinet-division-team-title-label">Kabinet Title</p>
                                <p className="kabinet-division-team-title">{division.kabinetTitle}</p>
                            </div>
                            {loading ? (
                                <p className="kabinet-team-state">Memuat anggota tim {division.name}...</p>
                            ) : groupedMembers[division.key].length > 0 ? (
                                <DraggableCardRow className="kabinet-division-team-grid">
                                    {groupedMembers[division.key].map((member) => (
                                        <TeamMemberCard key={member.id} member={member} />
                                    ))}
                                </DraggableCardRow>
                            ) : (
                                <p className="kabinet-team-state">
                                    Belum ada anggota untuk tim {division.name}. Tambahkan dari dashboard admin.
                                </p>
                            )}
                            <div className="kabinet-division-team-info">
                                <p className="kabinet-division-team-jobdesk-label">Kabinet Jobdesk</p>
                                <ul className="kabinet-division-team-jobdesk">
                                    {division.jobdesk.map((item) => (
                                        <li key={`${division.name}-${item}`}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {error && (
                <section className="kabinet-shell kabinet-section" aria-label="Status data">
                    <p className="kabinet-team-state kabinet-team-state--error">{error}</p>
                </section>
            )}

            <Footer />
        </main>
    );
}
