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
      giphyId: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: "div.giphy-embed-wrapper",
        getAttrs: (node) => {
          if (typeof node === "string" || !node) return {}
          const element = node as HTMLElement
          return {
            giphyId: element.getAttribute("data-giphy-id"),
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ class: "giphy-embed-wrapper" }, HTMLAttributes, { "data-giphy-id": HTMLAttributes.giphyId }),
      [
        "img",
        {
          src: `https://media.giphy.com/media/${HTMLAttributes.giphyId}/giphy.gif`,
          alt: "GIF do Giphy",
          class: "max-w-full h-auto rounded-md",
        },
      ],
      [
        "div",
        { class: "text-xs text-gray-500 text-center mt-1" },
        [
          "a",
          {
            href: `https://giphy.com/gifs/${HTMLAttributes.giphyId}`,
            target: "_blank",
            rel: "noopener noreferrer",
            class: "hover:text-red-400",
          },
          "via GIPHY",
        ],
      ],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(GiphyEmbed)
  },
})
