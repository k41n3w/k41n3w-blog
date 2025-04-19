"use client"

import { useEffect, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Heading from "@tiptap/extension-heading"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import CodeBlock from "@tiptap/extension-code-block"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import Highlight from "@tiptap/extension-highlight"
import Typography from "@tiptap/extension-typography"
import TextStyle from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Blockquote from "@tiptap/extension-blockquote"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  Code,
  Heading1,
  Heading2,
  Heading3,
  LinkIcon,
  ImageIcon,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Minus,
  Undo,
  Redo,
  Palette,
  Eraser,
  Eye,
  Edit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip } from "./tooltip"
import { processPostContent } from "@/lib/utils/content-processor"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [selectedColor, setSelectedColor] = useState("#000000")
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-red-500 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "mx-auto rounded-lg max-w-full",
        },
      }),
      CodeBlock,
      Placeholder.configure({
        placeholder: "Comece a escrever seu conteúdo aqui...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
      TextStyle,
      Color,
      Blockquote.configure({
        HTMLAttributes: {
          class: "border-l-4 border-red-500 pl-4 italic",
        },
      }),
      HorizontalRule,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none p-4 focus:outline-none",
      },
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

  const addImage = () => {
    if (!editor) return

    const url = window.prompt("URL da imagem")

    if (url) {
      // Use the original URL when editing, it will be proxied when displayed
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const setTextColor = () => {
    if (!editor) return

    const color = prompt("Digite uma cor (ex: #FF0000, red, rgb(255,0,0))", selectedColor)

    if (color) {
      setSelectedColor(color)
      editor.chain().focus().setColor(color).run()
    }
  }

  const clearFormatting = () => {
    if (!editor) return
    editor.chain().focus().unsetAllMarks().run()
  }

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  return (
    <div className="border border-gray-700 rounded-md overflow-hidden flex flex-col">
      {/* Barra de ferramentas fixa */}
      <div className="bg-gray-900 p-2 border-b border-gray-700 flex flex-wrap gap-1 sticky top-0 z-10">
        {/* Botão de alternar entre edição e visualização */}
        <div className="flex items-center gap-1 mr-2 border-r border-gray-700 pr-2">
          <Tooltip content={<p>{isPreviewMode ? "Modo de edição" : "Modo de visualização"}</p>}>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={`h-8 px-2 ${isPreviewMode ? "bg-gray-700" : ""}`}
              onClick={togglePreviewMode}
            >
              {isPreviewMode ? <Edit className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {isPreviewMode ? "Editar" : "Visualizar"}
            </Button>
          </Tooltip>
        </div>

        {!isPreviewMode && (
          <>
            {/* Grupo de formatação de texto */}
            <div className="flex items-center gap-1 mr-2 border-r border-gray-700 pr-2">
              <Tooltip content={<p>Negrito</p>}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-2 ${editor?.isActive("bold") ? "bg-gray-700" : ""}`}
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                >
                  <Bold className="h-4 w-4" />
                </Button>
              </Tooltip>

              <Tooltip content={<p>Itálico</p>}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-2 ${editor?.isActive("italic") ? "bg-gray-700" : ""}`}
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </Tooltip>

              <Tooltip content={<p>Sublinhado</p>}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-2 ${editor?.isActive("underline") ? "bg-gray-700" : ""}`}
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                >
                  <UnderlineIcon className="h-4 w-4" />
                </Button>
              </Tooltip>

              <Tooltip content={<p>Destacar</p>}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-2 ${editor?.isActive("highlight") ? "bg-gray-700" : ""}`}
                  onClick={() => editor?.chain().focus().toggleHighlight().run()}
                >
                  <Highlighter className="h-4 w-4" />
                </Button>
              </Tooltip>

              <Tooltip content={<p>Cor do texto</p>}>
                <Button type="button" size="sm" variant="ghost" className="h-8 px-2" onClick={setTextColor}>
                  <Palette className="h-4 w-4" style={{ color: selectedColor }} />
                </Button>
              </Tooltip>

              <Tooltip content={<p>Limpar formatação</p>}>
                <Button type="button" size="sm" variant="ghost" className="h-8 px-2" onClick={clearFormatting}>
                  <Eraser className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>

            {/* Grupo de cabeçalhos */}
            <div className="flex items-center gap-1 mr-2 border-r border-gray-700 pr-2">
              <Tooltip content={<p>Título 1</p>}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-2 ${editor?.isActive("heading", { level: 1 }) ? "bg-gray-700" : ""}`}
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                >
                  <Heading1 className="h-4 w-4" />
                </Button>
              </Tooltip>

              <Tooltip content={<p>Título 2</p>}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-2 ${editor?.isActive("heading", { level: 2 }) ? "bg-gray-700" : ""}`}
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                  <Heading2 className="h-4 w-4" />
                </Button>
              </Tooltip>

              <Tooltip content={<p>Título 3</p>}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-2 ${editor?.isActive("heading", { level: 3 }) ? "bg-gray-700" : ""}`}
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                  <Heading3 className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>

            {/* Grupo de alinhamento */}
            <div className="flex items-center gap-1 mr-2 border-r border-gray-700 pr-2">
              <Tooltip content={<p>Alinhar à esquerda</p>}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-2 ${editor?.isActive({ textAlign: "left" }) ? "bg-gray-700" : ""}`}
                  onClick={() => editor?.chain().focus().setTextAlign("left").run()}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
              </Tooltip>

              <Tooltip content={<p>Centralizar</p>}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-2 ${editor?.isActive({ textAlign: "center" }) ? "bg-gray-700" : ""}`}
                  onClick={() => editor?.chain().focus().setTextAlign("center").run()}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
              </Tooltip>

              <Tooltip content={<p>Alinhar à direita</p>}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-2 ${editor?.isActive({ textAlign: "right" }) ? "bg-gray-700" : ""}`}
                  onClick={() => editor?.chain().focus().setTextAlign("right").run()}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>

            {/* Grupo de listas */}
            <div className="flex items-center gap-1 mr-2 border-r border-gray-700 pr-2">
              <Tooltip content={<p>Lista com marcadores</p>}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-2 ${editor?.isActive("bulletList") ? "bg-gray-700" : ""}`}
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                >
                  <List className="h-4 w-4" />
                </Button>
              </Tooltip>

              <Tooltip content={<p>Lista numerada</p>}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-2 ${editor?.isActive("orderedList") ? "bg-gray-700" : ""}`}
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>

            {/* Grupo de elementos especiais */}
            <div className="flex items-center gap-1 mr-2 border-r border-gray-700 pr-2">
              <Tooltip content={<p>Citação</p>}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-2 ${editor?.isActive("blockquote") ? "bg-gray-700" : ""}`}
                  onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                >
                  <Quote className="h-4 w-4" />
                </Button>
              </Tooltip>

              <Tooltip content={<p>Bloco de código</p>}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-2 ${editor?.isActive("codeBlock") ? "bg-gray-700" : ""}`}
                  onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                >
                  <Code className="h-4 w-4" />
                </Button>
              </Tooltip>

              <Tooltip content={<p>Linha horizontal</p>}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>

            {/* Grupo de links e imagens */}
            <div className="flex items-center gap-1 mr-2 border-r border-gray-700 pr-2">
              <Tooltip content={<p>Inserir link</p>}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-2 ${editor?.isActive("link") ? "bg-gray-700" : ""}`}
                  onClick={setLink}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </Tooltip>

              <Tooltip content={<p>Inserir imagem</p>}>
                <Button type="button" size="sm" variant="ghost" className="h-8 px-2" onClick={addImage}>
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>

            {/* Grupo de desfazer/refazer */}
            <div className="flex items-center gap-1">
              <Tooltip content={<p>Desfazer</p>}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={() => editor?.chain().focus().undo().run()}
                  disabled={!editor?.can().undo()}
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </Tooltip>

              <Tooltip content={<p>Refazer</p>}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={() => editor?.chain().focus().redo().run()}
                  disabled={!editor?.can().redo()}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>
          </>
        )}
      </div>

      {/* Área de edição ou visualização com altura fixa e scroll interno */}
      <div className="bg-gray-800 h-[500px] overflow-y-auto">
        {isPreviewMode ? (
          <div className="prose prose-invert prose-red max-w-none p-4 editor-content">
            <div dangerouslySetInnerHTML={{ __html: processPostContent(editor?.getHTML() || "") }} />
          </div>
        ) : (
          <EditorContent editor={editor} className="min-h-full" />
        )}
      </div>
    </div>
  )
}
