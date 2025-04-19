import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import GistEmbed from "@/components/admin/embeds/gist-embed"
import GiphyEmbed from "@/components/admin/embeds/giphy-embed"

// Extensão para GitHub Gists
export const GistNode = Node.create({
  name: "gistEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      gistId: {
        default: null,
      },
      filename: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="gist-embed"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "gist-embed",
        "data-gist-id": HTMLAttributes.gistId,
        "data-filename": HTMLAttributes.filename || "",
      }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(GistEmbed)
  },
})

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
        tag: 'div[data-type="giphy-embed"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "giphy-embed",
        "data-giphy-id": HTMLAttributes.giphyId,
      }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(GiphyEmbed)
  },
})
