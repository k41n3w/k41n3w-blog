import { Node } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import CodeBlockComponent from "@/components/admin/embeds/code-block-component"

export const CustomCodeBlock = Node.create({
  name: "codeBlock",
  group: "block",
  content: "text*",
  marks: "",
  defining: true,
  isolating: true,

  addOptions() {
    return {
      languageClassPrefix: "language-",
    }
  },

  addAttributes() {
    return {
      language: {
        default: "ruby",
      },
      filename: {
        default: "",
      },
      // Add a direct content attribute to ensure code is saved
      codeContent: {
        default: "",
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: "pre",
        preserveWhitespace: "full",
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    // Use the stored codeContent attribute if available
    const content = HTMLAttributes.codeContent || ""

    // Create the HTML structure
    return [
      "pre",
      { "data-filename": HTMLAttributes.filename || null },
      ["code", { class: `language-${HTMLAttributes.language || "ruby"}` }, content],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent)
  },

  addCommands() {
    return {
      setCodeBlock:
        (attributes = {}) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes)
        },
      toggleCodeBlock:
        (attributes = {}) =>
        ({ commands, editor }) => {
          if (editor.isActive(this.name)) {
            return commands.setParagraph()
          }
          return commands.setCodeBlock(attributes)
        },
    }
  },
})
