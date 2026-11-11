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

  const openImagePicker = () => fileInput.current?.click();

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

  return (
    <div
      className={cn(
        "rounded-lg border bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        disabled && "opacity-60",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b p-1">
        <ToolButton label={t.editor.bold} active={state.bold} disabled={disabled} onClick={() => editor.chain().focus().toggleBold().run()}>
          <BoldIcon />
        </ToolButton>
        <ToolButton label={t.editor.italic} active={state.italic} disabled={disabled} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <ItalicIcon />
        </ToolButton>
        <ToolButton label={t.editor.underline} active={state.underline} disabled={disabled} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon />
        </ToolButton>
        <Separator orientation="vertical" className="mx-1 h-5!" />
        <ToolButton label={t.editor.heading2} active={state.h2} disabled={disabled} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2Icon />
        </ToolButton>
        <ToolButton label={t.editor.heading3} active={state.h3} disabled={disabled} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3Icon />
        </ToolButton>
        <Separator orientation="vertical" className="mx-1 h-5!" />
        <ToolButton label={t.editor.bulletList} active={state.bulletList} disabled={disabled} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <ListIcon />
        </ToolButton>
        <ToolButton label={t.editor.orderedList} active={state.orderedList} disabled={disabled} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrderedIcon />
        </ToolButton>
        <Separator orientation="vertical" className="mx-1 h-5!" />
        <ToolButton label={t.editor.link} active={state.link} disabled={disabled} onClick={setLink}>
          <Link2Icon />
        </ToolButton>
        {state.link ? (
          <ToolButton label={t.editor.unlink} disabled={disabled} onClick={() => editor.chain().focus().unsetLink().run()}>
            <Link2OffIcon />
          </ToolButton>
        ) : null}
        <ToolButton label={t.editor.image} disabled={disabled || uploading} onClick={openImagePicker}>
          <ImagePlusIcon />
        </ToolButton>
        <span className="ml-auto" />
        <ToolButton label={t.editor.undo} disabled={disabled || !state.canUndo} onClick={() => editor.chain().focus().undo().run()}>
          <UndoIcon />
        </ToolButton>
        <ToolButton label={t.editor.redo} disabled={disabled || !state.canRedo} onClick={() => editor.chain().focus().redo().run()}>
          <RedoIcon />
        </ToolButton>
        <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolButton({
  label,
  onClick,
  active = false,
  disabled = false,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
