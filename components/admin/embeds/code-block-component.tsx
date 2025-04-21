"use client"

import type React from "react"

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Code } from "lucide-react"

export default function CodeBlockComponent({ node, updateAttributes, editor }: NodeViewProps) {
  const [language, setLanguage] = useState(node.attrs.language || "ruby")
  const [filename, setFilename] = useState(node.attrs.filename || "")
  const [showOptions, setShowOptions] = useState(false)
  const [codeContent, setCodeContent] = useState(node.attrs.codeContent || "")
  const codeEditorRef = useRef<HTMLTextAreaElement>(null)

  const languages = [
    { value: "ruby", label: "Ruby" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "jsx", label: "JSX" },
    { value: "tsx", label: "TSX" },
    { value: "css", label: "CSS" },
    { value: "scss", label: "SCSS" },
    { value: "html", label: "HTML" },
    { value: "bash", label: "Bash" },
    { value: "json", label: "JSON" },
    { value: "yaml", label: "YAML" },
    { value: "markdown", label: "Markdown" },
    { value: "sql", label: "SQL" },
    { value: "plaintext", label: "Plain Text" },
  ]

  // Initialize the code content from the node
  useEffect(() => {
    // If we have stored codeContent in the node attributes, use that
    if (node.attrs.codeContent) {
      setCodeContent(node.attrs.codeContent)
    }
    // Otherwise try to get it from the node's text content
    else if (node.textContent) {
      setCodeContent(node.textContent)
      // Also update the node attribute
      updateAttributes({ codeContent: node.textContent })
    }
  }, [node, updateAttributes])

  const handleLanguageChange = (value: string) => {
    setLanguage(value)
    updateAttributes({ language: value })
  }

  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFilename(value)
    updateAttributes({ filename: value })
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setCodeContent(newContent)

    // Update both the node's text content and the codeContent attribute
    updateAttributes({ codeContent: newContent })

    // Also update the node's content using a transaction
    if (editor) {
      try {
        const { state, dispatch } = editor.view
        const { tr } = state

        // Find the position of this node
        const pos = editor.state.doc.resolve(0)
        let foundPos = null

        state.doc.descendants((node, pos) => {
          if (node === node && foundPos === null) {
            foundPos = pos
            return false
          }
          return true
        })

        if (foundPos !== null) {
          // Replace the content with a text node containing the new content
          const textNode = state.schema.text(newContent)
          tr.replaceWith(foundPos + 1, foundPos + node.nodeSize - 1, textNode)
          dispatch(tr)
        }
      } catch (error) {
        console.error("Error updating node content:", error)
      }
    }
  }

  return (
    <NodeViewWrapper className="code-block-wrapper my-4 rounded-md overflow-hidden border border-gray-700">
      <div className="bg-gray-800 p-2 flex justify-between items-center">
        <div className="flex items-center">
          <Code className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-300">{filename ? filename : `Código ${language}`}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={(e) => {
            e.preventDefault()
            setShowOptions(!showOptions)
          }}
          type="button"
        >
          {showOptions ? "Ocultar opções" : "Opções"}
        </Button>
      </div>

      {showOptions && (
        <div className="bg-gray-900 p-2 border-t border-b border-gray-700 flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Linguagem:</span>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="h-7 w-32 text-xs bg-gray-800 border-gray-700">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value} className="text-xs">
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Nome do arquivo:</span>
            <Input
              value={filename}
              onChange={handleFilenameChange}
              className="h-7 text-xs bg-gray-800 border-gray-700 w-40"
              placeholder="Opcional"
            />
          </div>
        </div>
      )}

      {/* Use a textarea instead of contentEditable div for more reliable content handling */}
      <textarea
        ref={codeEditorRef}
        value={codeContent}
        onChange={handleCodeChange}
        className="bg-gray-900 p-4 min-h-[100px] w-full outline-none text-gray-300 font-mono text-sm resize-y"
        spellCheck="false"
        data-gramm="false"
      />
    </NodeViewWrapper>
  )
}
