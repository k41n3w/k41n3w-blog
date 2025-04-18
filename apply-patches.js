const fs = require("fs")
const path = require("path")

// Path to the problematic file
const filePath = path.join(
  __dirname,
  "node_modules",
  ".pnpm",
  "@radix-ui+react-use-effect-event@0.0.0_@types+react@19.0.0_react@19.0.0",
  "node_modules",
  "@radix-ui",
  "react-use-effect-event",
  "dist",
  "index.mjs",
)

// Check if the file exists
if (fs.existsSync(filePath)) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, "utf8")

    // Replace the problematic code
    content = content.replace(
      /const useEffectEvent = React\.useEffectEvent \|\| function useEffectEvent/g,
      "const useEffectEvent = function useEffectEvent",
    )

    // Write the modified content back to the file
    fs.writeFileSync(filePath, content, "utf8")

    console.log("Successfully patched @radix-ui/react-use-effect-event")
  } catch (error) {
    console.error("Error patching file:", error)
  }
} else {
  console.error("File not found:", filePath)
}
