import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import CodeBlockComponent from "@/components/admin/embeds/code-block-component"

export const CustomCodeBlock = Node.create({
  name: "codeBlock",
  group: "block",
  content: "text*",
  marks: "",
  defining: true,
  addAttributes() {
    return {
      language: {
        default: "ruby",
        parseHTML: (element) => {
          const className = element.getAttribute("class") || ""
          const match = className.match(/language-(\w+)/)
          return match ? match[1] : "ruby"
        },
        renderHTML: (attributes) => {
          return {
            class: `language-${attributes.language || "ruby"}`,
          }
        },
      },
      filename: {
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
  renderHTML({ HTMLAttributes, node }) {
    return ["pre", { class: "code-block" }, ["code", mergeAttributes(HTMLAttributes), 0]]
  },
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent)
  },
})
