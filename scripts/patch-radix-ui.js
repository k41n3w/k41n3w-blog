const fs = require("fs")
const path = require("path")

// Define the paths to the problematic files
const filePaths = [
  "node_modules/@radix-ui/react-use-effect-event/dist/index.js",
  "node_modules/@radix-ui/react-use-effect-event/dist/index.mjs",
  // For pnpm
  "node_modules/.pnpm/@radix-ui+react-use-effect-event@0.0.0*/node_modules/@radix-ui/react-use-effect-event/dist/index.js",
  "node_modules/.pnpm/@radix-ui+react-use-effect-event@0.0.0*/node_modules/@radix-ui/react-use-effect-event/dist/index.mjs",
]

// Patch a single file
const patchFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File does not exist: ${filePath}`)
      return false
    }

    console.log(`Patching file: ${filePath}`)
    let content = fs.readFileSync(filePath, "utf8")

    // Replace the problematic code
    const originalCode = /const useEffectEvent = React\.useEffectEvent \|\| function useEffectEvent/g
    const replacementCode = "const useEffectEvent = function useEffectEvent"

    if (originalCode.test(content)) {
      content = content.replace(originalCode, replacementCode)
      fs.writeFileSync(filePath, content, "utf8")
      console.log(`✅ Successfully patched: ${filePath}`)
      return true
    } else {
      console.log(`⚠️ Pattern not found in: ${filePath}`)
      return false
    }
  } catch (error) {
    console.error(`❌ Error patching file ${filePath}:`, error)
    return false
  }
}

// Main function
const main = () => {
  console.log("🔍 Patching Radix UI files...")

  let patchedCount = 0
  for (const filePath of filePaths) {
    if (patchFile(filePath)) {
      patchedCount++
    }
  }

  console.log(`\n📊 Summary: Patched ${patchedCount} files`)
}

main()
