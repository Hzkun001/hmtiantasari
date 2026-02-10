import { supabase } from './supabase';

/**
 * Upload image ke Supabase Storage dan return public URL
 * @param file - File object dari input
 * @param bucket - Nama bucket di Supabase Storage (default: 'project-images')
 * @returns Public URL dari image yang diupload
 */
export async function uploadProjectImage(file: File, bucket: string = 'project-images'): Promise<string> {
    console.log('[uploadImage] Starting upload...');
    console.log('[uploadImage] File:', file.name, 'Size:', file.size);
    console.log('[uploadImage] Bucket:', bucket);

    try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        console.log('[uploadImage] Generated filename:', filePath);

        // Upload file directly (bucket existence check removed as anon role can't list buckets)
        console.log('[uploadImage] Uploading to Supabase Storage...');
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        console.log('[uploadImage] Upload response - data:', data);
        console.log('[uploadImage] Upload response - error:', error);

        if (error) {
            console.error('[uploadImage] Upload error details:', JSON.stringify(error, null, 2));

            // More helpful error messages
            if (error.message.includes('not found') || error.message.includes('does not exist')) {
                throw new Error(`Bucket "${bucket}" tidak ditemukan. Pastikan bucket sudah dibuat di Supabase Dashboard → Storage`);
            }
            if (error.message.includes('policy') || error.message.includes('permission')) {
                throw new Error(`Permission denied. Pastikan RLS policy untuk upload sudah diset di bucket "${bucket}"`);
            }
            throw new Error(`Upload gagal: ${error.message}`);
        }

        // Get public URL
        console.log('[uploadImage] Getting public URL...');
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        console.log('[uploadImage] Public URL:', publicUrl);

        return publicUrl;
    } catch (error) {
        console.error('[uploadImage] Caught error:', error);
        throw error;
    }
}

/**
 * Update project image_url di database
 * @param projectId - ID project yang akan diupdate
 * @param imageUrl - URL image baru
 */
export async function updateProjectImage(projectId: number, imageUrl: string): Promise<void> {
    const { error } = await supabase
        .from('Projects')
        .update({ image_url: imageUrl })
        .eq('id', projectId);

    if (error) {
        throw error;
    }
}

/**
 * Delete image dari Supabase Storage
 * @param imageUrl - Public URL dari image yang akan dihapus
 * @param bucket - Nama bucket di Supabase Storage (default: 'project-images')
 */
export async function deleteProjectImage(imageUrl: string, bucket: string = 'project-images'): Promise<void> {
    try {
        // Extract file path from URL
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts[pathParts.length - 1];

        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
}

/**
 * Upload team member image ke folder tertentu di bucket team-images
 * @param file - File object dari input
 * @param folderName - Nama folder kategori (e.g., 'humas', 'teknis', 'acara')
 * @returns Public URL dari image yang diupload
 */
export async function uploadTeamImage(file: File, folderName: string): Promise<string> {
    console.log('[uploadTeamImage] Starting upload to folder:', folderName);
    console.log('[uploadTeamImage] File:', file.name, 'Size:', file.size);

    try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${folderName}/${fileName}`;

        console.log('[uploadTeamImage] Generated file path:', filePath);

        // Upload file to team-images bucket
        console.log('[uploadTeamImage] Uploading to Supabase Storage...');
        const { data, error } = await supabase.storage
            .from('team-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        console.log('[uploadTeamImage] Upload response - data:', data);
        console.log('[uploadTeamImage] Upload response - error:', error);

        if (error) {
            console.error('[uploadTeamImage] Upload error details:', JSON.stringify(error, null, 2));

            if (error.message.includes('not found') || error.message.includes('does not exist')) {
                throw new Error('Bucket "team-images" tidak ditemukan. Pastikan bucket sudah dibuat di Supabase Dashboard → Storage');
            }
            if (error.message.includes('policy') || error.message.includes('permission')) {
                throw new Error('Permission denied. Pastikan RLS policy untuk upload sudah diset di bucket "team-images"');
            }
            throw new Error(`Upload gagal: ${error.message}`);
        }

        // Get public URL
        console.log('[uploadTeamImage] Getting public URL...');
        const { data: { publicUrl } } = supabase.storage
            .from('team-images')
            .getPublicUrl(filePath);

        console.log('[uploadTeamImage] Public URL:', publicUrl);

        return publicUrl;
    } catch (error) {
        console.error('[uploadTeamImage] Caught error:', error);
        throw error;
    }
}

/**
 * Delete team image dari Supabase Storage
 * @param imageUrl - Public URL dari image yang akan dihapus
 */
export async function deleteTeamImage(imageUrl: string): Promise<void> {
    try {
        // Extract file path from URL (includes folder name)
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/');
        // Get last 2 parts: folder/filename
        const filePath = pathParts.slice(-2).join('/');

        const { error } = await supabase.storage
            .from('team-images')
            .remove([filePath]);

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Error deleting team image:', error);
        throw error;
    }
}
