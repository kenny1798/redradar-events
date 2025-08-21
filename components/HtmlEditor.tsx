// components/HtmlEditor.tsx
"use client";
import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";

type Props = { value?: string; onChange: (html: string) => void; label?: string };

export default function HtmlEditor({ value = "", onChange, label }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ autolink: true, openOnClick: true }),
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          // container class untuk text; list/bq/hr styled via .tiptap CSS
          "min-h-[160px] w-full rounded-b-lg bg-white px-3 py-2 outline-none",
        "data-placeholder": "Write description…",
      } as any,
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(value || "", false);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    if ((value || "") !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="grid gap-1">
        {label && <span className="text-sm text-slate-500">{label}</span>}
        <div className="rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm text-slate-400">
          Loading editor…
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-1">
      {label && <span className="text-sm text-slate-500">{label}</span>}

      {/* Toolbar */}
      <div className="rounded-t-lg border border-slate-400 bg-white px-2 py-1 text-sm">
        <div className="flex flex-wrap gap-1">
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className="px-2 py-1 hover:bg-slate-100 rounded">B</button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className="px-2 py-1 hover:bg-slate-100 rounded"><em>I</em></button>
          <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className="px-2 py-1 hover:bg-slate-100 rounded"><u>U</u></button>
          <span className="mx-1 h-5 w-px bg-slate-300" />
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className="px-2 py-1 hover:bg-slate-100 rounded">• List</button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className="px-2 py-1 hover:bg-slate-100 rounded">1. List</button>
          <span className="mx-1 h-5 w-px bg-slate-300" />
          <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className="px-2 py-1 hover:bg-slate-100 rounded">“ Quote</button>
          <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className="px-2 py-1 hover:bg-slate-100 rounded">HR</button>
        </div>
      </div>

      {/* Editor content */}
      <div className="tiptap rounded-b-lg border border-t-0 border-slate-400 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
