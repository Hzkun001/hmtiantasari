import { supabase } from '@/lib/supabase';

const CERTIFICATE_BUCKET = process.env.NEXT_PUBLIC_CERTIFICATE_BUCKET || 'certificates';

export type CertificateValidationStatus = 'empty_code' | 'code_not_registered' | 'pdf_missing' | 'valid';

export type CertificateBucketLookup = {
    code: string;
    certificateId: number | null;
    issuedAt: string | null;
    status: CertificateValidationStatus;
    found: boolean;
    pdfPath: string | null;
    pdfViewUrl: string | null;
    pdfDownloadUrl: string | null;
    error: Error | null;
};

export function normalizeCertificateCode(raw: string) {
    return raw
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '')
        .replace(/[^A-Z0-9-]/g, '')
        .replace(/-+/g, '-');
}

function createPublicUrl(path: string, download?: boolean) {
    const { data } = supabase.storage.from(CERTIFICATE_BUCKET).getPublicUrl(path, {
        download: download ? true : undefined,
    });
    return data.publicUrl;
}

function pickFirstByExt(paths: string[], exts: string[]) {
    const lowered = paths.map((p) => p.toLowerCase());
    for (let i = 0; i < paths.length; i++) {
        for (const ext of exts) {
            if (lowered[i].endsWith(ext)) return paths[i];
        }
    }
    return null;
}

function pickPreferred(paths: string[], preferredNames: string[]) {
    const map = new Map(paths.map((p) => [p.toLowerCase(), p]));
    for (const name of preferredNames) {
        const hit = map.get(name.toLowerCase());
        if (hit) return hit;
    }
    return null;
}

async function listFolderPaths(folder: string) {
    const { data, error } = await supabase.storage.from(CERTIFICATE_BUCKET).list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
    });
    if (error || !data) return null;

    const names = data.map((o) => o.name).filter(Boolean);
    return names.map((name) => `${folder}/${name}`);
}

async function findPathsByCode(code: string) {
    // Convention 1: each certificate lives in a folder named exactly as its code.
    const folderPaths = await listFolderPaths(code);
    if (folderPaths && folderPaths.length) return folderPaths;

    // Convention 2: files are stored at bucket root, with filenames containing the code.
    const { data, error } = await supabase.storage.from(CERTIFICATE_BUCKET).list('', {
        limit: 200,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
        search: code,
    });
    if (error || !data) return [];

    return data.map((o) => o.name).filter(Boolean);
}

async function findPdfPathForCode(code: string) {
    const paths = await findPathsByCode(code);
    const pdfExts = ['.pdf'];

    const preferredPdf =
        pickPreferred(paths, [`${code}/certificate.pdf`, `${code}/sertifikat.pdf`, `${code}.pdf`]) ??
        pickFirstByExt(paths, pdfExts);

    return preferredPdf;
}

export async function fetchCertificateFromBucket(rawCode: string): Promise<CertificateBucketLookup> {
    const code = normalizeCertificateCode(rawCode);

    if (!code) {
        return {
            code,
            certificateId: null,
            issuedAt: null,
            status: 'empty_code',
            found: false,
            pdfPath: null,
            pdfViewUrl: null,
            pdfDownloadUrl: null,
            error: null,
        };
    }

    try {
        const { data: certificateRow, error: tableError } = await supabase
            .from('Certificates')
            .select('id, code, issued_at')
            .eq('code', code)
            .maybeSingle();

        if (tableError) {
            return {
                code,
                certificateId: null,
                issuedAt: null,
                status: 'code_not_registered',
                found: false,
                pdfPath: null,
                pdfViewUrl: null,
                pdfDownloadUrl: null,
                error: new Error(tableError.message),
            };
        }

        if (!certificateRow) {
            return {
                code,
                certificateId: null,
                issuedAt: null,
                status: 'code_not_registered',
                found: false,
                pdfPath: null,
                pdfViewUrl: null,
                pdfDownloadUrl: null,
                error: null,
            };
        }

        const pdfPath = await findPdfPathForCode(code);
        const pdfViewUrl = pdfPath ? createPublicUrl(pdfPath) : null;
        const pdfDownloadUrl = pdfPath ? createPublicUrl(pdfPath, true) : null;

        const isValid = Boolean(pdfPath && pdfViewUrl);

        return {
            code,
            certificateId: certificateRow.id,
            issuedAt: certificateRow.issued_at ?? null,
            status: isValid ? 'valid' : 'pdf_missing',
            found: isValid,
            pdfPath,
            pdfViewUrl,
            pdfDownloadUrl,
            error: null,
        };
    } catch (err: any) {
        return {
            code,
            certificateId: null,
            issuedAt: null,
            status: 'code_not_registered',
            found: false,
            pdfPath: null,
            pdfViewUrl: null,
            pdfDownloadUrl: null,
            error: err instanceof Error ? err : new Error('Lookup failed'),
        };
    }
}
