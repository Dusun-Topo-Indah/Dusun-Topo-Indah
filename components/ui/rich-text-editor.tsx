"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Bold, Italic, Strikethrough, Heading2, Heading3, List, ListOrdered, ImageIcon } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import * as React from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-md max-w-full h-auto mx-auto object-contain",
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onTransaction: () => {
      forceUpdate();
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] w-full bg-transparent px-4 py-4 text-sm outline-none prose prose-sm max-w-none focus:outline-none",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col rounded-md border bg-white shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-ring focus-within:border-primary transition-all">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-2">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          onMouseDown={(e) => e.preventDefault()}
          className="border border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary transition-all"
          aria-label="Toggle bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          onMouseDown={(e) => e.preventDefault()}
          className="border border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary transition-all"
          aria-label="Toggle italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("strike")}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          onMouseDown={(e) => e.preventDefault()}
          className="border border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary transition-all"
          aria-label="Toggle strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-4 bg-border mx-1" />
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          onMouseDown={(e) => e.preventDefault()}
          className="border border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary transition-all"
          aria-label="Toggle heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 3 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          onMouseDown={(e) => e.preventDefault()}
          className="border border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary transition-all"
          aria-label="Toggle heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-4 bg-border mx-1" />
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          onMouseDown={(e) => e.preventDefault()}
          className="border border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary transition-all"
          aria-label="Toggle bullet list"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          onMouseDown={(e) => e.preventDefault()}
          className="border border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary transition-all"
          aria-label="Toggle ordered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-4 bg-border mx-1" />
        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => {
            const url = window.prompt("Masukkan URL Gambar:");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          onMouseDown={(e) => e.preventDefault()}
          className="border hover:bg-muted transition-all"
          aria-label="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Toggle>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
