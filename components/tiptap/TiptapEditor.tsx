'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback } from 'react';
import { uploadActivitiesImage } from '@/lib/uploadImage';

interface TiptapEditorProps {
    content: Record<string, unknown>;
    onChange: (json: Record<string, unknown>) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({ inline: false, allowBase64: true }),
            Placeholder.configure({ placeholder: 'Tulis berita di sini...' }),
        ],
        content: content && Object.keys(content).length > 0 ? content : undefined,
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON());
        },
    });

    const handleImageUpload = useCallback(async () => {
        if (!editor) return;

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            try {
                const url = await uploadActivitiesImage(file);
                editor.chain().focus().setImage({ src: url }).run();
            } catch (err) {
                console.error('Upload failed:', err);
                alert('Gagal upload gambar. Coba lagi.');
            }
        };
        input.click();
    }, [editor]);

    if (!editor) return null;

    return (
        <div className="border border-white/20 rounded-xl overflow-hidden bg-[#11131a]">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border-b border-white/10 bg-[#1a1b23]">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`px-3 py-1 rounded text-sm font-bold ${editor.isActive('bold') ? 'bg-[#FFD56C] text-black' : 'text-white hover:bg-white/10'}`}
                >
                    B
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`px-3 py-1 rounded text-sm italic ${editor.isActive('italic') ? 'bg-[#FFD56C] text-black' : 'text-white hover:bg-white/10'}`}
                >
                    I
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`px-3 py-1 rounded text-sm line-through ${editor.isActive('strike') ? 'bg-[#FFD56C] text-black' : 'text-white hover:bg-white/10'}`}
                >
                    S
                </button>
                <div className="w-px h-6 bg-white/10 self-center mx-1" />
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-3 py-1 rounded text-sm ${editor.isActive('heading', { level: 2 }) ? 'bg-[#FFD56C] text-black' : 'text-white hover:bg-white/10'}`}
                >
                    H2
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`px-3 py-1 rounded text-sm ${editor.isActive('heading', { level: 3 }) ? 'bg-[#FFD56C] text-black' : 'text-white hover:bg-white/10'}`}
                >
                    H3
                </button>
                <div className="w-px h-6 bg-white/10 self-center mx-1" />
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`px-3 py-1 rounded text-sm ${editor.isActive('bulletList') ? 'bg-[#FFD56C] text-black' : 'text-white hover:bg-white/10'}`}
                >
                    List
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`px-3 py-1 rounded text-sm ${editor.isActive('blockquote') ? 'bg-[#FFD56C] text-black' : 'text-white hover:bg-white/10'}`}
                >
                    Quote
                </button>
                <div className="w-px h-6 bg-white/10 self-center mx-1" />
                <button
                    type="button"
                    onClick={handleImageUpload}
                    className="px-3 py-1 rounded text-sm text-white hover:bg-white/10"
                >
                    📷 Image
                </button>
            </div>

            {/* Editor Content */}
            <EditorContent
                editor={editor}
                className="p-4 min-h-[300px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[300px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-neutral-500 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
            />
        </div>
    );
}
