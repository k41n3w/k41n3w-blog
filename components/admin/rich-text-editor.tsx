"use client"

import { useEffect, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Heading from "@tiptap/extension-heading"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import CodeBlock from "@tiptap/extension-code-block"
import Placeholder from "@tiptap/extension-placeholder"
import { Bold, Italic, List, ListOrdered, Code, Heading1, Heading2, Heading3, LinkIcon, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      CodeBlock,
      Placeholder.configure({
        placeholder: "Comece a escrever seu conteúdo aqui...",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const setLink = () => {
    if (!editor) return

    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  // Atualizar a função addImage para usar o novo formato de URL com hash

  const addImage = () => {
    if (!editor) return

    const url = window.prompt("URL da imagem")

    if (url) {
      // Use the original URL when editing, it will be proxied when displayed
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div className="border border-gray-700 rounded-md overflow-hidden">
      <div className="bg-gray-900 p-2 border-b border-gray-700 flex flex-wrap gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className={`h-8 px-2 ${editor?.isActive("bold") ? "bg-gray-700" : ""}`}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className={`h-8 px-2 ${editor?.isActive("italic") ? "bg-gray-700" : ""}`}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className={`h-8 px-2 ${editor?.isActive("heading", { level: 1 }) ? "bg-gray-700" : ""}`}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className={`h-8 px-2 ${editor?.isActive("heading", { level: 2 }) ? "bg-gray-700" : ""}`}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className={`h-8 px-2 ${editor?.isActive("heading", { level: 3 }) ? "bg-gray-700" : ""}`}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className={`h-8 px-2 ${editor?.isActive("bulletList") ? "bg-gray-700" : ""}`}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className={`h-8 px-2 ${editor?.isActive("orderedList") ? "bg-gray-700" : ""}`}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className={`h-8 px-2 ${editor?.isActive("codeBlock") ? "bg-gray-700" : ""}`}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className={`h-8 px-2 ${editor?.isActive("link") ? "bg-gray-700" : ""}`}
          onClick={setLink}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-8 px-2" onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-invert max-w-none p-4 min-h-[300px] bg-gray-800 focus:outline-none"
      />
    </div>
  )
}
