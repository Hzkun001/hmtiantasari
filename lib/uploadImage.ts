import { supabase } from './supabase';

const ACTIVITY_BUCKET = 'activity-images';
const TEAM_BUCKET = 'team-images';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function uploadError(message: string, bucket: string): never {
    if (message.includes('not found') || message.includes('does not exist')) {
        throw new Error(`Bucket "${bucket}" tidak ditemukan.`);
    }
    if (message.includes('policy') || message.includes('permission')) {
        throw new Error(`Upload ke bucket "${bucket}" tidak diizinkan oleh policy.`);
    }
    throw new Error(`Upload gagal: ${message}`);
}

async function uploadImage(file: File, bucket: string, folder?: string) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) throw new Error('Format gambar harus JPG, PNG, WebP, atau GIF.');
    if (file.size > MAX_IMAGE_BYTES) throw new Error('Ukuran gambar maksimal 5 MB.');

    const extension = file.name.includes('.') ? `.${file.name.split('.').pop()}` : '';
    const filename = `${crypto.randomUUID()}${extension}`;
    const path = folder ? `${folder}/${filename}` : filename;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
    });

    if (error) uploadError(error.message, bucket);
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

async function deleteImage(imageUrl: string, bucket: string) {
    const marker = `/object/public/${bucket}/`;
    const pathname = new URL(imageUrl).pathname;
    const markerIndex = pathname.indexOf(marker);
    if (markerIndex < 0) throw new Error(`URL bukan berasal dari bucket "${bucket}".`);

    const path = decodeURIComponent(pathname.slice(markerIndex + marker.length));
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
}

export const uploadActivitiesImage = (file: File) => uploadImage(file, ACTIVITY_BUCKET);
export const deleteActivitiesImage = (url: string) => deleteImage(url, ACTIVITY_BUCKET);
export const uploadTeamImage = (file: File, folder: string) => uploadImage(file, TEAM_BUCKET, folder);
export const deleteTeamImage = (url: string) => deleteImage(url, TEAM_BUCKET);
