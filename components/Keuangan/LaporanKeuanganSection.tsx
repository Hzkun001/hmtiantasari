'use client';

import { useMemo, useState } from 'react';

type ReportFilterMode = 'year' | 'cabinet';

type CashReportDocument = {
    id: string;
    releaseDate: string;
    title: string;
    year: number;
    cabinet: string;
    pdfUrl: string | null;
};

const PERIOD_LABEL = 'Arsip laporan 2025 - 2026';
const LAST_UPDATED = '2026-02-12T14:00:00+08:00';
const TOTAL_UANG_HIMPUNAN = 3287927;

const REPORT_DOCUMENTS: CashReportDocument[] = [
    {
        id: 'DOC-2026-ARNANTA',
        releaseDate: '2026-02-12',
        title: 'Laporan Keuangan Kabinet Arnanta 2026',
        year: 2026,
        cabinet: 'Arnanta',
        pdfUrl: 'https://drive.google.com/file/d/1dcuQn_xKncqSonFpcXtqx0u4e7gvMZvp/preview',
    },
    {
        id: 'DOC-2025-ARNANTA',
        releaseDate: '2025-04-23',
        title: 'Laporan Tahunan HMTI 2025',
        year: 2025,
        cabinet: 'Arnanta',
        pdfUrl: 'https://drive.google.com/file/d/1XTQ9u8NvUUOt81hp2coqub9lJzCEuaZp/preview',
    },
];

function formatToReadableDate(value: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

function formatToRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

function sortByReleaseDateDesc(documents: CashReportDocument[]) {
    return [...documents].sort((left, right) => {
        return new Date(right.releaseDate).getTime() - new Date(left.releaseDate).getTime();
    });
}

function resolveDownloadUrl(pdfUrl: string): string {
    const googleDriveMatch = pdfUrl.match(/\/file\/d\/([^/]+)/);
    const googleDriveFileId = googleDriveMatch?.[1];

    if (googleDriveFileId) {
        return `https://drive.google.com/uc?export=download&id=${googleDriveFileId}`;
    }

    return pdfUrl;
}

export default function CashReportSection() {
    const sortedDocuments = useMemo(() => sortByReleaseDateDesc(REPORT_DOCUMENTS), []);
    const [filterMode, setFilterMode] = useState<ReportFilterMode>('year');
    const [selectedValue, setSelectedValue] = useState<string>('all');
    const [appliedFilter, setAppliedFilter] = useState<{ mode: ReportFilterMode; value: string }>({
        mode: 'year',
        value: 'all',
    });

    const yearOptions = useMemo(() => {
        return Array.from(new Set(sortedDocuments.map((document) => String(document.year)))).sort(
            (left, right) => Number(right) - Number(left)
        );
    }, [sortedDocuments]);

    const cabinetOptions = useMemo(() => {
        return Array.from(new Set(sortedDocuments.map((document) => document.cabinet))).sort((left, right) =>
            left.localeCompare(right)
        );
    }, [sortedDocuments]);

    const activeOptions = filterMode === 'year' ? yearOptions : cabinetOptions;

    const filteredDocuments = useMemo(() => {
        return sortedDocuments.filter((document) => {
            if (appliedFilter.value === 'all') return true;

            if (appliedFilter.mode === 'year') {
                return String(document.year) === appliedFilter.value;
            }

            return document.cabinet === appliedFilter.value;
        });
    }, [sortedDocuments, appliedFilter]);

    function handleModeChange(nextMode: ReportFilterMode) {
        setFilterMode(nextMode);
        setSelectedValue('all');
    }

    function handleApplyFilter() {
        setAppliedFilter({ mode: filterMode, value: selectedValue });
    }

    return (
        <>
            <section className="border-b border-white/10 pt-28 pb-8 md:pt-32 md:pb-10">
                <div className="container">
                    <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
                        <h1 className="text-4xl text-white sm:text-5xl md:text-6xl" style={{ fontFamily: 'var(--font-bentham)' }}>
                            Annual Reports
                        </h1>
                        <p className="max-w-2xl text-sm text-neutral-300 md:text-base">
                            Arsip laporan keuangan HMTI yang dapat difilter per tahun atau per kabinet.
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-300 md:text-sm">
                            <span className="rounded-md border border-white/15 bg-white/5 px-3 py-1">{PERIOD_LABEL}</span>
                            <span className="rounded-md border border-white/15 bg-white/5 px-3 py-1">
                                Update: {formatToReadableDate(LAST_UPDATED)}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pb-14 md:pb-16">
                <div className="container">
                    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
                        <section className="rounded-xl border border-white/15 bg-white/3 p-5 md:p-6">
                            <h2 className="text-2xl text-white md:text-3xl" style={{ fontFamily: 'var(--font-bentham)' }}>
                                Overview
                            </h2>
                            <p className="mt-3 text-xs uppercase tracking-widest text-neutral-400">Total Uang Himpunan</p>
                            <p className="mt-2 text-3xl text-white md:text-4xl" style={{ fontFamily: 'var(--font-bentham)' }}>
                                {formatToRupiah(TOTAL_UANG_HIMPUNAN)}
                            </p>
                            <p className="mt-2 text-sm text-neutral-400">
                                Berdasarkan rekap kas terakhir per {formatToReadableDate(LAST_UPDATED)}.
                            </p>
                        </section>

                        <section className="rounded-xl border border-white/15 bg-white/3 p-5 md:p-6">
                            <h2 className="text-2xl text-white md:text-3xl" style={{ fontFamily: 'var(--font-bentham)' }}>
                                Arsip Laporan
                            </h2>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <select
                                    value={filterMode}
                                    onChange={(event) => handleModeChange(event.target.value as ReportFilterMode)}
                                    className="rounded-md border border-white/20 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                                >
                                    <option value="year">Per Tahun</option>
                                    <option value="cabinet">Per Kabinet</option>
                                </select>

                                <select
                                    value={selectedValue}
                                    onChange={(event) => setSelectedValue(event.target.value)}
                                    className="rounded-md border border-white/20 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                                >
                                    <option value="all">Semua</option>
                                    {activeOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    onClick={handleApplyFilter}
                                    className="rounded-md bg-[#FFD56C] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
                                >
                                    Search
                                </button>
                            </div>

                            <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
                                <table className="min-w-190 w-full border-collapse">
                                    <thead className="bg-white/5 text-left text-sm text-neutral-300">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Release Date</th>
                                            <th className="px-4 py-3 font-semibold">Document Title</th>
                                            <th className="px-4 py-3 font-semibold">Kabinet</th>
                                            <th className="px-4 py-3 font-semibold">Document</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDocuments.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-sm text-neutral-400">
                                                    Dokumen tidak ditemukan.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredDocuments.map((document) => (
                                                <tr key={document.id} className="border-t border-white/10 text-sm text-neutral-200">
                                                    <td className="px-4 py-3">{formatToReadableDate(document.releaseDate)}</td>
                                                    <td className="px-4 py-3">{document.title}</td>
                                                    <td className="px-4 py-3">{document.cabinet}</td>
                                                    <td className="px-4 py-3">
                                                        {document.pdfUrl ? (
                                                            <a
                                                                href={resolveDownloadUrl(document.pdfUrl)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="rounded-md bg-[#FFD56C] px-3 py-1.5 text-xs font-semibold text-black transition hover:opacity-80"
                                                            >
                                                                Download PDF
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-neutral-500">N/A</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </section>
        </>
    );
}
