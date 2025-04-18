"use client"

// This script will help us find and fix any imports of useEffectEvent from React
// We'll replace them with our custom implementation

import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, extname } from "path"

// Function to fix imports in a file
function fixImportsInFile(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, "utf8")

    // Check if the file imports useEffectEvent from 'react'
    const importRegex = /import\s+\{\s*(?:[^{}]*,\s*)?useEffectEvent(?:\s*,\s*[^{}]*)?\s*\}\s*from\s+['"]react['"]/

    if (importRegex.test(content)) {
      console.log(`Fixing imports in ${filePath}`)

      // Replace the import with our custom implementation
      let fixedContent = content

      // Case 1: useEffectEvent is the only import
      fixedContent = fixedContent.replace(
        /import\s+\{\s*useEffectEvent\s*\}\s*from\s+['"]react['"]/g,
        `import { useEffectEvent } from '@/hooks/use-effect-event'`,
      )

      // Case 2: useEffectEvent is part of multiple imports
      fixedContent = fixedContent.replace(
        /import\s+\{\s*([^{}]*,\s*)?useEffectEvent(\s*,\s*[^{}]*)?\s*\}\s*from\s+['"]react['"]/g,
        (match, before = "", after = "") => {
          // Remove useEffectEvent from the React imports
          const cleanedImport = `import { ${before}${after} } from 'react'`
            .replace(/,\s*,/g, ",")
            .replace(/{\s*,/g, "{")
            .replace(/,\s*}/g, "}")
            .replace(/{\s*}/g, "{ }")

          // Add the separate import for useEffectEvent
          return `${cleanedImport}\nimport { useEffectEvent } from '@/hooks/use-effect-event'`
        },
      )

      // Write the fixed content back to the file
      writeFileSync(filePath, fixedContent)
      return true
    }

    return false
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error)
    return false
  }
}

// Function to recursively search directories and fix files
function fixImportsInDirectory(dir: string, fileExtensions: string[] = [".ts", ".tsx", ".js", ".jsx"]): number {
  let fixedCount = 0

  try {
    const files = readdirSync(dir, { withFileTypes: true })

    for (const file of files) {
      const filePath = join(dir, file.name)

      if (file.isDirectory()) {
        // Skip node_modules and .next directories
        if (file.name !== "node_modules" && file.name !== ".next") {
          fixedCount += fixImportsInDirectory(filePath, fileExtensions)
        }
      } else if (fileExtensions.includes(extname(file.name))) {
        if (fixImportsInFile(filePath)) {
          fixedCount++
        }
      }
    }
  } catch (error) {
    console.error(`Error searching directory ${dir}:`, error)
  }

  return fixedCount
}

// Start fixing imports from the current directory
const fixedCount = fixImportsInDirectory(".")
console.log(`Fixed imports in ${fixedCount} files.`)
