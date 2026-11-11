"use client";

import Image from "@tiptap/extension-image";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  BoldIcon,
  Heading2Icon,
  Heading3Icon,
  ImagePlusIcon,
  ItalicIcon,
  Link2Icon,
  Link2OffIcon,
  ListIcon,
  ListOrderedIcon,
  RedoIcon,
  UnderlineIcon,
  UndoIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { t } from "@/lib/i18n/admin";
import { uploadFile, UploadError } from "@/lib/upload-client";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, disabled, placeholder, className }: RichTextEditorProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
        codeBlock: false,
        code: false,
      }),
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-48 px-3 py-2 outline-none prose-headings:font-semibold prose-img:rounded-md",
        ...(placeholder ? { "data-placeholder": placeholder } : {}),
      },
    },
  });

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold") ?? false,
      italic: editor?.isActive("italic") ?? false,
      underline: editor?.isActive("underline") ?? false,
      h2: editor?.isActive("heading", { level: 2 }) ?? false,
      h3: editor?.isActive("heading", { level: 3 }) ?? false,
      bulletList: editor?.isActive("bulletList") ?? false,
      orderedList: editor?.isActive("orderedList") ?? false,
      link: editor?.isActive("link") ?? false,
      canUndo: editor?.can().undo() ?? false,
      canRedo: editor?.can().redo() ?? false,
    }),
  });

  if (!editor || !state) {
    return <div className={cn("min-h-56 rounded-lg border bg-muted/30", className)} />;
  }

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(t.editor.linkPrompt, previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const onPickImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const stored = await uploadFile(file, "image");
      editor.chain().focus().setImage({ src: stored.url, alt: file.name }).run();
    } catch (err) {
      toast.error(err instanceof UploadError ? err.message : t.upload.failed);
    } finally {
      setUploading(false);
    }
  };

  const tool = (
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
    active = false,
    toolDisabled = false,
  ) => (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled || toolDisabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {icon}
    </Button>
  );

  return (
    <div
      className={cn(
        "rounded-lg border bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        disabled && "opacity-60",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b p-1">
        {tool(t.editor.bold, <BoldIcon />, () => editor.chain().focus().toggleBold().run(), state.bold)}
        {tool(t.editor.italic, <ItalicIcon />, () => editor.chain().focus().toggleItalic().run(), state.italic)}
        {tool(t.editor.underline, <UnderlineIcon />, () => editor.chain().focus().toggleUnderline().run(), state.underline)}
        <Separator orientation="vertical" className="mx-1 h-5!" />
        {tool(t.editor.heading2, <Heading2Icon />, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), state.h2)}
        {tool(t.editor.heading3, <Heading3Icon />, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), state.h3)}
        <Separator orientation="vertical" className="mx-1 h-5!" />
        {tool(t.editor.bulletList, <ListIcon />, () => editor.chain().focus().toggleBulletList().run(), state.bulletList)}
        {tool(t.editor.orderedList, <ListOrderedIcon />, () => editor.chain().focus().toggleOrderedList().run(), state.orderedList)}
        <Separator orientation="vertical" className="mx-1 h-5!" />
        {tool(t.editor.link, <Link2Icon />, setLink, state.link)}
        {state.link
          ? tool(t.editor.unlink, <Link2OffIcon />, () => editor.chain().focus().unsetLink().run())
          : null}
        {tool(t.editor.image, <ImagePlusIcon />, () => fileInput.current?.click(), false, uploading)}
        <span className="ml-auto" />
        {tool(t.editor.undo, <UndoIcon />, () => editor.chain().focus().undo().run(), false, !state.canUndo)}
        {tool(t.editor.redo, <RedoIcon />, () => editor.chain().focus().redo().run(), false, !state.canRedo)}
        <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
