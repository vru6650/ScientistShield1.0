import React, { useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { createLowlight } from 'lowlight';

// Import all necessary TipTap extensions
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Youtube } from '@tiptap/extension-youtube';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';

// Local Imports
import TiptapToolbar from './TiptapToolbar'; // Import the new toolbar
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload'; // Your custom hook

export default function TiptapEditor({ content, onChange, placeholder }) {
    const { upload, isUploading } = useCloudinaryUpload();
    const fileInputRef = useRef(null);
    const lowlight = createLowlight();

    const editor = useEditor({
        // All the extensions needed for the new toolbar features
        extensions: [
            StarterKit.configure({
                codeBlock: false, // We are using CodeBlockLowlight instead
                horizontalRule: false, // We will configure it separately
            }),
            HorizontalRule,
            Image,
            Highlight,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Subscript,
            Superscript,
            Link.configure({
                openOnClick: false,
                autolink: true,
            }),
            TextStyle, // Required for Color
            Color,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableCell,
            TableHeader,
            Youtube.configure({
                controls: false,
                class: 'youtube-iframe',
            }),
            CharacterCount.configure({
                limit: 10000,
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'tiptap', // This class is for styling the editor content
            },
        },
    });

    const addYoutubeVideo = () => {
        const url = prompt('Enter YouTube URL');
        if (url && editor) {
            editor.commands.setYoutubeVideo({ src: url });
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const url = await upload(file, {
                allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                maxSizeMB: 2
            });
            if (url && editor) {
                editor.chain().focus().setImage({ src: url }).run();
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('Image upload failed: ' + error.message);
        }
    };

    return (
        <div className="tiptap-container">
            <TiptapToolbar
                editor={editor}
                isUploading={isUploading}
                onAddImage={() => fileInputRef.current?.click()}
                onAddYoutubeVideo={addYoutubeVideo}
            />
            <EditorContent editor={editor} placeholder={placeholder} />
            {editor && (
                <div className="character-count">
                    {editor.storage.characterCount.characters()} characters
                    {' / '}
                    {editor.storage.characterCount.words()} words
                </div>
            )}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
            />
        </div>
    );
}


