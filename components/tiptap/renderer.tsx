'use client';

import Image from 'next/image';
import { getCloudinaryFetchImageUrl } from '@/lib/cloudinary';

interface TiptapNode {
    type: string;
    attrs?: Record<string, unknown>;
    content?: TiptapNode[];
    text?: string;
    marks?: { type: string; attrs?: Record<string, unknown> }[];
}

function renderNode(node: TiptapNode, index: number): React.ReactNode {
    const { type, attrs, content, text, marks } = node;

    switch (type) {
        case 'doc':
            return <>{content?.map((child, i) => renderNode(child, i))}</>;

        case 'paragraph': {
            const children = content?.map((child, i) => renderNode(child, i));
            let el = <p>{children}</p>;

            if (marks) {
                marks.forEach((mark) => {
                    if (mark.type === 'bold') {
                        el = <strong>{el}</strong>;
                    }
                    if (mark.type === 'italic') {
                        el = <em>{el}</em>;
                    }
                    if (mark.type === 'strike') {
                        el = <s>{el}</s>;
                    }
                });
            }

            return el;
        }

        case 'heading': {
            const level = (attrs?.level as number) ?? 2;
            const children = content?.map((child, i) => renderNode(child, i));
            let el: React.ReactNode = children;

            if (marks) {
                marks.forEach((mark) => {
                    if (mark.type === 'bold') {
                        el = <strong>{el}</strong>;
                    }
                    if (mark.type === 'italic') {
                        el = <em>{el}</em>;
                    }
                });
            }

            if (level === 1) return <h1 key={`h1-${index}`}>{el}</h1>;
            if (level === 2) return <h2 key={`h2-${index}`}>{el}</h2>;
            if (level === 3) return <h3 key={`h3-${index}`}>{el}</h3>;
            if (level === 4) return <h4 key={`h4-${index}`}>{el}</h4>;
            return <h5 key={`h5-${index}`}>{el}</h5>;
        }

        case 'text': {
            let el: React.ReactNode = text;

            if (marks) {
                marks.forEach((mark) => {
                    if (mark.type === 'bold') {
                        el = <strong>{el}</strong>;
                    }
                    if (mark.type === 'italic') {
                        el = <em>{el}</em>;
                    }
                    if (mark.type === 'strike') {
                        el = <s>{el}</s>;
                    }
                });
            }

            return el;
        }

        case 'bulletList':
            return (
                <ul key={`ul-${index}`} className="list-disc pl-6 space-y-2">
                    {content?.map((child, i) => renderNode(child, i))}
                </ul>
            );

        case 'orderedList':
            return (
                <ol key={`ol-${index}`} className="list-decimal pl-6 space-y-2">
                    {content?.map((child, i) => renderNode(child, i))}
                </ol>
            );

        case 'listItem':
            return <li key={`li-${index}`}>{content?.map((child, i) => renderNode(child, i))}</li>;

        case 'blockquote':
            return (
                <blockquote key={`bq-${index}`} className="border-l-4 border-[#FFD56C] pl-4 italic text-neutral-300 my-4">
                    {content?.map((child, i) => renderNode(child, i))}
                </blockquote>
            );

        case 'image': {
            const rawSrc = attrs?.src as string;
            const alt = attrs?.alt as string | undefined;
            if (!rawSrc) return null;

            // Try Cloudinary transformation first
            const src = getCloudinaryFetchImageUrl(rawSrc, {
                width: 1200,
                height: 800,
                crop: 'fill',
            }) || rawSrc;

            return (
                <div key={`img-${index}`} className="relative w-full h-64 my-6 rounded-xl overflow-hidden">
                    <Image
                        src={src}
                        alt={alt || 'Image'}
                        fill
                        className="object-cover"
                    />
                </div>
            );
        }

        case 'hardBreak':
            return <br key={`br-${index}`} />;

        case 'horizontalRule':
            return <hr key={`hr-${index}`} className="border-white/10 my-6" />;

        default:
            return content?.map((child, i) => renderNode(child, i));
    }
}

interface TiptapRendererProps {
    content: Record<string, unknown> | null | string;
}

export function TiptapRenderer({ content }: TiptapRendererProps) {
    if (!content) return null;

    let json: TiptapNode;
    if (typeof content === 'string') {
        try {
            json = JSON.parse(content) as TiptapNode;
        } catch {
            return null;
        }
    } else {
        json = content as TiptapNode;
    }

    return <div className="space-y-4">{renderNode(json, 0)}</div>;
}
