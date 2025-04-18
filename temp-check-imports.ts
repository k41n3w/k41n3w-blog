// This file is for checking imports only and will be removed
// It helps us find where useEffectEvent is being imported from 'react'

import { readFileSync, readdirSync } from "fs"
import { join, extname } from "path"

// Function to check if a file imports useEffectEvent from 'react'
function checkFile(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, "utf8")
    // Look for import patterns like:
    // import { useEffectEvent } from 'react'
    // import { useState, useEffectEvent } from 'react'
    const importRegex = /import\s+\{\s*(?:[^{}]*,\s*)?useEffectEvent(?:\s*,\s*[^{}]*)?\s*\}\s*from\s+['"]react['"]/
    return importRegex.test(content)
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    return false
  }
}

// Function to recursively search directories
function searchDirectory(dir: string, fileExtensions: string[] = [".ts", ".tsx", ".js", ".jsx"]): string[] {
  const results: string[] = []

  try {
    const files = readdirSync(dir, { withFileTypes: true })

    for (const file of files) {
      const filePath = join(dir, file.name)

      if (file.isDirectory()) {
        // Skip node_modules and .next directories
        if (file.name !== "node_modules" && file.name !== ".next") {
          results.push(...searchDirectory(filePath, fileExtensions))
        }
      } else if (fileExtensions.includes(extname(file.name))) {
        if (checkFile(filePath)) {
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
const filesWithUseEffectEvent = searchDirectory(".")
console.log("Files importing useEffectEvent from react:")
console.log(filesWithUseEffectEvent)
