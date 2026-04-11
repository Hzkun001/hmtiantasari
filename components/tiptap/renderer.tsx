'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import Image from 'next/image';

interface TiptapNode {
    type: string;
    attrs?: Record<string, unknown>;
    content?: TiptapNode[];
    text?: string;
    marks?: { type: string; attrs?: Record<string, unknown> }[];
}

function renderNode(node: TiptapNode): React.ReactNode {
    const { type, attrs, content, text, marks } = node;

    switch (type) {
        case 'doc':
            return <>{content?.map((child, i) => renderNode(child))}</>;

        case 'paragraph': {
            const children = content?.map((child, i) => renderNode(child));
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
            const children = content?.map((child, i) => renderNode(child));
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

            if (level === 1) return <h1>{el}</h1>;
            if (level === 2) return <h2>{el}</h2>;
            if (level === 3) return <h3>{el}</h3>;
            if (level === 4) return <h4>{el}</h4>;
            return <h5>{el}</h5>;
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
                <ul className="list-disc pl-6 space-y-2">
                    {content?.map((child, i) => renderNode(child))}
                </ul>
            );

        case 'orderedList':
            return (
                <ol className="list-decimal pl-6 space-y-2">
                    {content?.map((child, i) => renderNode(child))}
                </ol>
            );

        case 'listItem':
            return <li>{content?.map((child, i) => renderNode(child))}</li>;

        case 'blockquote':
            return (
                <blockquote className="border-l-4 border-[#FFD56C] pl-4 italic text-neutral-300 my-4">
                    {content?.map((child, i) => renderNode(child))}
                </blockquote>
            );

        case 'image': {
            const src = attrs?.src as string;
            const alt = attrs?.alt as string | undefined;
            if (!src) return null;
            return (
                <div className="relative w-full h-64 my-6 rounded-xl overflow-hidden">
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
            return <br />;

        case 'horizontalRule':
            return <hr className="border-white/10 my-6" />;

        default:
            return content?.map((child, i) => renderNode(child));
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

    return <div className="space-y-4">{renderNode(json)}</div>;
}
