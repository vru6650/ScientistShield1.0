import React, { useCallback } from 'react';
import {
    FaBold, FaItalic, FaStrikethrough, FaListUl, FaListOl, FaQuoteLeft,
    FaCode, FaLink, FaImage, FaYoutube, FaTable, FaSubscript, FaSuperscript,
    FaHighlighter, FaTasks, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify,
    FaUndo, FaRedo, FaEraser, FaMinus
} from 'react-icons/fa';
import {
    LuHeading1, LuHeading2, LuHeading3, LuHeading4, LuHeading5, LuHeading6
} from 'react-icons/lu';

const TiptapToolbar = ({ editor, onAddImage, isUploading, onAddYoutubeVideo }) => {
    if (!editor) {
        return null;
    }

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    return (
        <div className="tiptap-toolbar">
            {/* Action Buttons */}
            <div className="toolbar-section">
                <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><FaUndo /></button>
                <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><FaRedo /></button>
            </div>

            {/* Formatting */}
            <div className="toolbar-section">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''} title="Bold"><FaBold /></button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''} title="Italic"><FaItalic /></button>
                <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''} title="Strikethrough"><FaStrikethrough /></button>
                <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={editor.isActive('highlight') ? 'is-active' : ''} title="Highlight"><FaHighlighter /></button>
                <button onClick={() => editor.chain().focus().toggleSubscript().run()} className={editor.isActive('subscript') ? 'is-active' : ''} title="Subscript"><FaSubscript /></button>
                <button onClick={() => editor.chain().focus().toggleSuperscript().run()} className={editor.isActive('superscript') ? 'is-active' : ''} title="Superscript"><FaSuperscript /></button>
                <button onClick={() => editor.chain().focus().unsetAllMarks().run()} title="Clear Formatting"><FaEraser /></button>
            </div>

            {/* Color Picker */}
            <div className="toolbar-section">
                <input
                    type="color"
                    onInput={event => editor.chain().focus().setColor(event.target.value).run()}
                    value={editor.getAttributes('textStyle').color || '#000000'}
                    title="Text Color"
                />
            </div>

            {/* Headings */}
            <div className="toolbar-section">
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''} title="H1"><LuHeading1 /></button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''} title="H2"><LuHeading2 /></button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''} title="H3"><LuHeading3 /></button>
            </div>

            {/* Alignment */}
            <div className="toolbar-section">
                <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''} title="Align Left"><FaAlignLeft /></button>
                <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''} title="Align Center"><FaAlignCenter /></button>
                <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''} title="Align Right"><FaAlignRight /></button>
                <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''} title="Align Justify"><FaAlignJustify /></button>
            </div>

            {/* Lists & Blocks */}
            <div className="toolbar-section">
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''} title="Bullet List"><FaListUl /></button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''} title="Numbered List"><FaListOl /></button>
                <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={editor.isActive('taskList') ? 'is-active' : ''} title="Task List"><FaTasks /></button>
                <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'is-active' : ''} title="Blockquote"><FaQuoteLeft /></button>
                <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'is-active' : ''} title="Code Block"><FaCode /></button>
                <button onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule"><FaMinus /></button>
            </div>

            {/* Links, Images, Videos */}
            <div className="toolbar-section">
                <button onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''} title="Add Link"><FaLink /></button>
                <button onClick={onAddImage} disabled={isUploading} title="Add Image"><FaImage /></button>
                <button onClick={onAddYoutubeVideo} title="Add YouTube Video"><FaYoutube /></button>
            </div>

            {/* Table Controls */}
            {editor.isActive('table') ? (
                <div className="toolbar-section">
                    <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert Table"><FaTable /></button>
                    <button onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add Column Before">Col-</button>
                    <button onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column After">Col+</button>
                    <button onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete Column">Del Col</button>
                    <button onClick={() => editor.chain().focus().addRowBefore().run()} title="Add Row Before">Row-</button>
                    <button onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row After">Row+</button>
                    <button onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row">Del Row</button>
                    <button onClick={() => editor.chain().focus().mergeOrSplit().run()} title="Merge/Split Cells">Merge</button>
                    <button onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table">Del Table</button>
                </div>
            ) : (
                <div className="toolbar-section">
                    <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert Table"><FaTable /></button>
                </div>
            )}
        </div>
    );
};

export default TiptapToolbar;