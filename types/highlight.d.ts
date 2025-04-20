// Este arquivo é necessário apenas se você estiver usando TypeScript
// e quiser ter tipos para o highlight.js
import "highlight.js"

declare module "highlight.js" {
  interface HLJSOptions {
    languages?: string[]
  }
}
