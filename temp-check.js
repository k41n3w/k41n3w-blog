// Este é um arquivo temporário para verificar se há alguma referência às variáveis de ambiente problemáticas
// Você pode executar este arquivo com Node.js para verificar se há alguma referência a essas variáveis
// Depois de executar, você pode remover este arquivo

const fs = require("fs")
const path = require("path")

const variablesToCheck = ["VERCEL_PROJECT_ID", "VERCEL_DOMAIN", "VERCEL_TOKEN"]
const directoriesToSkip = ["node_modules", ".next", ".git"]
const fileExtensionsToCheck = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".md",
  ".mdx",
  ".html",
  ".css",
  ".scss",
  ".less",
  ".env",
]

function searchInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    const results = []

    for (const variable of variablesToCheck) {
      if (content.includes(variable)) {
        results.push({
          variable,
          file: filePath,
        })
      }
    }

    return results
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    return []
  }
}

function searchInDirectory(directory) {
  const results = []

  try {
    const files = fs.readdirSync(directory)

    for (const file of files) {
      const filePath = path.join(directory, file)
      const stats = fs.statSync(filePath)

      if (stats.isDirectory()) {
        if (!directoriesToSkip.includes(file)) {
          results.push(...searchInDirectory(filePath))
        }
      } else {
        const ext = path.extname(file)
        if (fileExtensionsToCheck.includes(ext)) {
          results.push(...searchInFile(filePath))
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error)
  }

  return results
}

// Start the search from the current directory
const results = searchInDirectory(".")

if (results.length === 0) {
  console.log("No references to the variables found.")
} else {
  console.log("References found:")
  for (const result of results) {
    console.log(`${result.variable} in ${result.file}`)
  }
}
