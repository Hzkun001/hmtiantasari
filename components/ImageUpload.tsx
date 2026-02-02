'use client';

import { useState } from 'react';
import { uploadProjectImage, updateProjectImage } from '@/lib/uploadImage';

interface ImageUploadProps {
    projectId: number;
    onUploadSuccess?: (imageUrl: string) => void;
}

export default function ImageUpload({ projectId, onUploadSuccess }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        try {
            setUploading(true);
            setError(null);

            console.log('Starting upload for project:', projectId);
            console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);

            // Upload image
            const imageUrl = await uploadProjectImage(file);
            console.log('Upload successful! URL:', imageUrl);

            // Update database
            await updateProjectImage(projectId, imageUrl);
            console.log('Database updated successfully');

            // Call success callback
            onUploadSuccess?.(imageUrl);

            alert('Image uploaded successfully!');
        } catch (err: any) {
            console.error('Upload error:', err);
            console.error('Error type:', typeof err);
            console.error('Error message:', err?.message);
            console.error('Error stack:', err?.stack);

            let errorMessage = 'Failed to upload image';

            if (err?.message) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            } else if (err?.error) {
                errorMessage = err.error;
            } else {
                errorMessage = 'Unknown error occurred. Check console for details.';
            }

            setError(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <label
                htmlFor={`file-upload-${projectId}`}
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {uploading ? 'Uploading...' : 'Upload Image'}
            </label>
            <input
                id={`file-upload-${projectId}`}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
    );
}
