const fs = require("fs")
const path = require("path")
const glob = require("glob")

// Find all instances of the problematic file
const findProblematicFiles = () => {
  return glob.sync("node_modules/**/@radix-ui/react-use-effect-event/dist/index.{js,mjs}")
}

// Patch a single file
const patchFile = (filePath) => {
  console.log(`Patching file: ${filePath}`)

  try {
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
  console.log("🔍 Finding problematic Radix UI files...")
  const files = findProblematicFiles()

  if (files.length === 0) {
    console.log("No problematic files found.")
    return
  }

  console.log(`Found ${files.length} files to patch:`)

  let patchedCount = 0
  for (const file of files) {
    if (patchFile(file)) {
      patchedCount++
    }
  }

  console.log(`\n📊 Summary: Patched ${patchedCount}/${files.length} files`)
}

main()
