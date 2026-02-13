const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();

type CloudinaryFetchOptions = {
    width?: number;
    height?: number;
    crop?: 'fill' | 'limit';
    gravity?: 'auto' | 'center';
    quality?: string;
};

function isHttpUrl(value: string): boolean {
    return /^https?:\/\//i.test(value);
}

function isCloudinaryUrl(value: string): boolean {
    return /https?:\/\/res\.cloudinary\.com\//i.test(value);
}

export function getCloudinaryFetchImageUrl(
    sourceUrl: string | null | undefined,
    options: CloudinaryFetchOptions = {},
): string | null {
    if (!sourceUrl) return null;
    if (!isHttpUrl(sourceUrl)) return sourceUrl;
    if (isCloudinaryUrl(sourceUrl)) return sourceUrl;
    if (!CLOUDINARY_CLOUD_NAME) return sourceUrl;

    const {
        width,
        height,
        crop = 'fill',
        gravity = 'auto',
        quality = 'auto:good',
    } = options;

    const transforms = ['f_auto', `q_${quality}`];

    if (width) transforms.push(`w_${Math.round(width)}`);
    if (height) transforms.push(`h_${Math.round(height)}`);
    if (width || height) {
        transforms.push(`c_${crop}`);
        transforms.push(`g_${gravity}`);
    }

    const encodedSource = encodeURIComponent(sourceUrl);
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${transforms.join(',')}/${encodedSource}`;
}
