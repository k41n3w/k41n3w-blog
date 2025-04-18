const fs = require("fs")
const path = require("path")

function searchInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8")

    // Check for direct imports
    const directImportRegex =
      /import\s+\{\s*(?:[^{}]*,\s*)?useEffectEvent(?:\s*,\s*[^{}]*)?\s*\}\s*from\s+['"]react['"]/

    // Check for namespace imports and usage
    const namespaceUsageRegex = /React\.useEffectEvent/

    if (directImportRegex.test(content) || namespaceUsageRegex.test(content)) {
      return true
    }

    return false
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    return false
  }
}

function searchDirectory(dir, extensions = [".js", ".jsx", ".ts", ".tsx"]) {
  const results = []

  try {
    const files = fs.readdirSync(dir)

    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        // Skip node_modules and .next
        if (file !== "node_modules" && file !== ".next") {
          results.push(...searchDirectory(filePath, extensions))
        }
      } else if (extensions.includes(path.extname(file))) {
        if (searchInFile(filePath)) {
          results.push(filePath)
        }
      }
    }
  } catch (error) {
    console.error(`Error searching directory ${dir}:`, error)
  }

  return results
}

// Start the search from the current directory
const filesUsingUseEffectEvent = searchDirectory(".")
console.log("Files using useEffectEvent:")
console.log(filesUsingUseEffectEvent)
