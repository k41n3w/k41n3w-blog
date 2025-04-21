"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Heading from "@tiptap/extension-heading"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import Highlight from "@tiptap/extension-highlight"
import Typography from "@tiptap/extension-typography"
import TextStyle from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Blockquote from "@tiptap/extension-blockquote"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import { GiphyNode } from "@/lib/editor/extensions/embed-extensions"
import { extractGiphyId } from "@/lib/utils/embed-utils"
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
  Smile,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip } from "./tooltip"
import parse from "html-react-parser"
import { Element } from "html-react-parser"
import GiphyRenderer from "@/components/post/giphy-renderer"
import { CustomCodeBlock } from "@/lib/editor/extensions/code-extensions"
import CodeBlock from "@/components/post/code-block"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [selectedColor, setSelectedColor] = useState("#000000")
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [editorContent, setEditorContent] = useState(value || "")
  const editorInstanceRef = useRef(null)
  const previewModeRef = useRef(isPreviewMode)
  const [editorKey, setEditorKey] = useState(0) // Used to force re-render editor if needed

  // Update ref when preview mode changes
  useEffect(() => {
    previewModeRef.current = isPreviewMode
  }, [isPreviewMode])

  // Create editor only once
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default code block
      }),
      CustomCodeBlock,
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
      GiphyNode,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      try {
        const html = editor.getHTML()
        setEditorContent(html)
        onChange(html)

        // Log for debugging
        console.log("Editor content updated:", html)
      } catch (error) {
        console.error("Error updating editor content:", error)
      }
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none p-4 focus:outline-none",
      },
    },
  })

  // Store editor instance in ref
  useEffect(() => {
    if (editor) {
      editorInstanceRef.current = editor
    }
  }, [editor])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Toggle preview mode safely
  const togglePreviewMode = useCallback(() => {
    setIsPreviewMode((prev) => !prev)
  }, [])

  // Editor functions
  const setLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)

    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return

    const url = window.prompt("URL da imagem")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const addGiphy = useCallback(() => {
    if (!editor) return

    const url = window.prompt("URL do GIF do Giphy (ex: https://giphy.com/gifs/ID)")
    if (url) {
      const giphyId = extractGiphyId(url)
      if (giphyId) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "giphyEmbed",
            attrs: { giphyId },
          })
          .run()
      } else {
        alert(
          "URL do Giphy inválida. Use o formato: https://giphy.com/gifs/ID ou https://media.giphy.com/media/ID/giphy.gif",
        )
      }
    }
  }, [editor])

  const setTextColor = useCallback(() => {
    if (!editor) return

    const color = prompt("Digite uma cor (ex: #FF0000, red, rgb(255,0,0))", selectedColor)
    if (color) {
      setSelectedColor(color)
      editor.chain().focus().setColor(color).run()
    }
  }, [editor, selectedColor])

  const clearFormatting = useCallback(() => {
    if (!editor) return
    editor.chain().focus().unsetAllMarks().run()
  }, [editor])

  if (!isMounted) {
    return null
  }

  // Helper function to detect language from class
  const detectLanguage = (className: string): string => {
    if (!className) return ""
    const match = className.match(/language-(\w+)/)
    return match ? match[1] : ""
  }

  return (
    <div className="border border-gray-700 rounded-md overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-900 p-2 border-b border-gray-700 flex flex-wrap gap-1 sticky top-0 z-10">
        {/* Toggle preview/edit mode */}
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
            {/* Text formatting */}
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

            {/* Headings */}
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

            {/* Alignment */}
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

            {/* Lists */}
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

            {/* Special elements */}
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
                  onClick={() => {
                    try {
                      if (editor) {
                        if (editor.isActive("codeBlock")) {
                          editor.chain().focus().setParagraph().run()
                        } else {
                          editor
                            .chain()
                            .focus()
                            .setCodeBlock({
                              language: "ruby",
                              codeContent: "", // Initialize with empty content
                            })
                            .run()
                        }
                      }
                    } catch (error) {
                      console.error("Error toggling code block:", error)
                    }
                  }}
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

            {/* Links and images */}
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

              <Tooltip content={<p>Inserir GIF do Giphy</p>}>
                <Button type="button" size="sm" variant="ghost" className="h-8 px-2" onClick={addGiphy}>
                  <Smile className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>

            {/* Undo/redo */}
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

      {/* Editor/Preview area */}
      <div className="bg-gray-800 h-[500px] overflow-y-auto">
        {isPreviewMode ? (
          <div className="prose prose-invert prose-red max-w-none p-4 editor-content">
            {parse(editorContent || "", {
              replace: (domNode) => {
                try {
                  // Handle code blocks
                  if (domNode instanceof Element && domNode.name === "pre") {
                    // Check for code element inside pre
                    const codeElement = domNode.children.find(
                      (child): child is Element => child instanceof Element && child.name === "code",
                    )

                    if (codeElement) {
                      // Detect language from classes
                      const language = detectLanguage(codeElement.attribs.class || "")

                      // Get code content from data attribute or text content
                      let code = domNode.attribs["data-code-content"] || ""

                      if (!code && codeElement.children.length > 0) {
                        if (typeof codeElement.children[0].data === "string") {
                          code = codeElement.children[0].data
                        }
                      }

                      // Get filename from attributes
                      let filename = ""
                      if (domNode.attribs["data-filename"]) {
                        filename = domNode.attribs["data-filename"]
                      }

                      return <CodeBlock code={code} language={language} filename={filename} />
                    }
                  }

                  // Handle Giphy images
                  if (domNode instanceof Element && domNode.name === "img") {
                    const { src, alt, class: className } = domNode.attribs
                    const isGiphy =
                      src?.includes("giphy.com") ||
                      domNode.parent?.attribs?.class?.includes("giphy") ||
                      domNode.parent?.parent?.attribs?.class?.includes("giphy")

                    if (isGiphy) {
                      return <GiphyRenderer src={src} alt={alt} />
                    }
                  }
                } catch (error) {
                  console.error("Error in HTML parsing:", error)
                }
                return undefined
              },
            })}
          </div>
        ) : (
          <EditorContent editor={editor} className="min-h-full" />
        )}
      </div>
    </div>
  )
}
