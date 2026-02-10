'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCertificateFromBucket, normalizeCertificateCode } from '@/lib/certificates';

type LookupStatus = 'idle' | 'loading' | 'found' | 'not_found' | 'error';

function formatIssuedAt(value?: string | null) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(date);
}

export default function CertificateCheckerClient() {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<LookupStatus>('idle');
    const [message, setMessage] = useState<string | null>(null);
    const [certificateId, setCertificateId] = useState<number | null>(null);
    const [issuedAtValue, setIssuedAtValue] = useState<string | null>(null);
    const [pdfViewUrl, setPdfViewUrl] = useState<string | null>(null);
    const [pdfDownloadUrl, setPdfDownloadUrl] = useState<string | null>(null);
    const [shake, setShake] = useState(false);

    const issuedAt = useMemo(() => formatIssuedAt(issuedAtValue), [issuedAtValue]);

    const triggerShake = useCallback(() => {
        setShake(true);
        window.setTimeout(() => setShake(false), 520);
    }, []);

    const handleCheck = useCallback(async (rawCode: string) => {
        setMessage(null);
        setCertificateId(null);
        setIssuedAtValue(null);
        setPdfViewUrl(null);
        setPdfDownloadUrl(null);
        setStatus('loading');

        const result = await fetchCertificateFromBucket(rawCode);
        const normalized = result.code;
        setCode(normalized);

        if (result.error) {
            setStatus('error');
            setMessage('Terjadi kendala saat memeriksa. Coba beberapa saat lagi.');
            triggerShake();
            return;
        }

        if (!normalized) {
            setStatus('idle');
            setMessage('Masukkan kode sertifikat terlebih dahulu.');
            triggerShake();
            return;
        }

        if (result.status === 'code_not_registered') {
            setStatus('not_found');
            setMessage('Kode tidak ditemukan. Pastikan kode benar, lalu coba lagi.');
            triggerShake();
            return;
        }

        if (result.status === 'pdf_missing') {
            setStatus('not_found');
            setMessage('Kode terdaftar, tetapi file PDF sertifikat belum tersedia di storage.');
            triggerShake();
            return;
        }

        setCertificateId(result.certificateId);
        setIssuedAtValue(result.issuedAt);
        setPdfViewUrl(result.pdfViewUrl);
        setPdfDownloadUrl(result.pdfDownloadUrl);
        setStatus('found');
    }, [triggerShake]);

    const onSubmit = useCallback((event: React.FormEvent) => {
        event.preventDefault();
        void handleCheck(code);
    }, [code, handleCheck]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const param = new URLSearchParams(window.location.search).get('code');
        if (!param) return;

        const normalized = normalizeCertificateCode(param);
        if (!normalized) return;

        setCode(normalized);
        void handleCheck(normalized);
    }, [handleCheck]);

    const viewUrl = pdfViewUrl;
    const previewMode: 'pdf' | 'none' = pdfViewUrl ? 'pdf' : 'none';

    return (
        <div className="certificate-checker-shell">
            <div className="container certificate-checker-container">
                <div className="certificate-checker-head">
                    <p className="certificate-checker-eyebrow">Validasi Sertifikat</p>
                    <h1 className="certificate-checker-title">Certificate Checker</h1>
                    <p className="certificate-checker-subtitle">
                        Masukkan kode unik sertifikat untuk memvalidasi resmi dari HMTI.
                    </p>
                </div>

                <div className={`certificate-checker-card ${shake ? 'is-shaking' : ''}`}>
                    <form className="certificate-checker-form" onSubmit={onSubmit}>
                        <label className="certificate-checker-label" htmlFor="certificate-code">
                            Kode Sertifikat
                        </label>
                        <div className="certificate-checker-row">
                            <input
                                id="certificate-code"
                                className="certificate-checker-input"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="Contoh: HMIT-TI-ML-067"
                                inputMode="text"
                                autoCapitalize="characters"
                                autoComplete="off"
                                spellCheck={false}
                                aria-describedby="certificate-code-help"
                            />
                            <button
                                className="certificate-checker-button certificate-checker-button--primary"
                                type="submit"
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? (
                                    <span className="certificate-checker-button-content">
                                        <span className="certificate-checker-spinner" aria-hidden="true" />
                                        Memeriksa
                                    </span>
                                ) : (
                                    'Periksa'
                                )}
                            </button>
                        </div>
                        <p id="certificate-code-help" className="certificate-checker-help">
                            # Kode tertulis di bagian atas sertifikat. HMIT-TI-(Nama kegiatan)-(kode)
                        </p>
                    </form>

                    {(message || status === 'found') && (
                        <div className="certificate-checker-result" aria-live="polite" data-state={status}>
                            {status !== 'found' ? (
                                <div className="certificate-checker-alert">
                                    <div className={`certificate-checker-badge certificate-checker-badge--${status}`}>
                                        {status === 'not_found' ? 'Tidak Terdaftar' : 'Info'}
                                    </div>
                                    <p className="certificate-checker-message">{message}</p>
                                </div>
                            ) : (
                                <div className="certificate-checker-valid">
                                    <div className="certificate-checker-valid-head">
                                        <div className="certificate-checker-badge certificate-checker-badge--found">
                                            Valid
                                        </div>
                                        <div className="certificate-checker-actions">
                                            {viewUrl && (
                                                <a
                                                    className="certificate-checker-button certificate-checker-button--ghost"
                                                    href={viewUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    View
                                                </a>
                                            )}
                                            {pdfDownloadUrl && (
                                                <a
                                                    className="certificate-checker-button certificate-checker-button--secondary"
                                                    href={pdfDownloadUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Download PDF
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <dl className="certificate-checker-meta">
                                        {certificateId !== null && (
                                            <div className="certificate-checker-meta-item">
                                                <dt>ID</dt>
                                                <dd>{certificateId}</dd>
                                            </div>
                                        )}
                                        {issuedAt && (
                                            <div className="certificate-checker-meta-item">
                                                <dt>Tanggal</dt>
                                                <dd>{issuedAt}</dd>
                                            </div>
                                        )}
                                        <div className="certificate-checker-meta-item">
                                            <dt>Kode</dt>
                                            <dd className="certificate-checker-code">{code}</dd>
                                        </div>
                                    </dl>

                                    {previewMode === 'pdf' && pdfViewUrl && (
                                        <div className="certificate-checker-preview">
                                            <iframe
                                                className="certificate-checker-preview-iframe"
                                                src={pdfViewUrl}
                                                title="Preview sertifikat"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
