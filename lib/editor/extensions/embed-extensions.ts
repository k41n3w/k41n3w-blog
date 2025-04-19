import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import GiphyEmbed from "@/components/admin/embeds/giphy-embed"

// Extensão para GIFs do Giphy
export const GiphyNode = Node.create({
  name: "giphyEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      giphyId: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-node-type="giphyEmbed"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-node-type": "giphyEmbed",
        "data-giphy-id": HTMLAttributes.giphyId,
      }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(GiphyEmbed)
  },
})
