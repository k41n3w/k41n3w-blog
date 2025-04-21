"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDown } from "lucide-react"

export default function MatrixAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animationComplete, setAnimationComplete] = useState(false)
  const animationCompleteRef = useRef(false)

  useEffect(() => {
    // Update the ref when the state changes
    animationCompleteRef.current = animationComplete
  }, [animationComplete])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = 400
    }

    // Initial size
    updateCanvasSize()

    // Matrix characters
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~"
    const targetText = "k41n3w"

    // Array of character columns
    const columns = Math.floor(canvas.width / 20)
    const drops: number[] = []

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100
    }

    // Text to display at the end
    let displayedText = ""
    let textTimer = 0
    let finalTextDisplayed = false

    // Draw function
    function draw() {
      // Semi-transparent black background for trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "#ff0000" // Red text
      ctx.font = "15px monospace"

      // Draw falling characters
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = characters.charAt(Math.floor(Math.random() * characters.length))

        // x coordinate of the drop
        const x = i * 20
        // y coordinate of the drop
        const y = drops[i] * 20

        ctx.fillText(text, x, y)

        // Send the drop back to the top randomly after it crosses the screen
        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        // Increment y coordinate
        drops[i]++
      }

      // Check the current animation state using the ref
      const isAnimationComplete = animationCompleteRef.current

      // Display final text after some time, but only if animation is not complete
      if (!finalTextDisplayed && !isAnimationComplete) {
        textTimer++
        if (textTimer > 150) {
          if (displayedText.length < targetText.length) {
            displayedText = targetText.substring(0, displayedText.length + 1)
          } else {
            finalTextDisplayed = true
            setTimeout(() => {
              setAnimationComplete(true)
            }, 1000)
          }
        }

        if (displayedText.length > 0) {
          ctx.font = "bold 40px monospace"
          ctx.fillStyle = "#ff0000"
          const textWidth = ctx.measureText(displayedText).width
          ctx.fillText(displayedText, (canvas.width - textWidth) / 2, canvas.height / 2)
        }
      } else if (finalTextDisplayed && !isAnimationComplete) {
        // Keep displaying the final text until animation is complete
        ctx.font = "bold 40px monospace"
        ctx.fillStyle = "#ff0000"
        const textWidth = ctx.measureText(targetText).width
        ctx.fillText(targetText, (canvas.width - textWidth) / 2, canvas.height / 2)
      }
      // If animation is complete, don't draw the k41n3w text at all

      // Continue animation
      requestAnimationFrame(draw)
    }

    // Start the animation
    draw()

    // Handle window resize
    const handleResize = () => {
      updateCanvasSize()
      // Recalculate columns and drops on resize
      const newColumns = Math.floor(canvas.width / 20)

      // Adjust drops array if needed
      if (newColumns > drops.length) {
        // Add new drops if canvas got wider
        for (let i = drops.length; i < newColumns; i++) {
          drops.push(Math.random() * -100)
        }
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, []) // No dependencies to ensure the effect runs only once

  return (
    <>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      <div
        className={`absolute top-0 left-0 w-full h-full flex items-center justify-center transition-opacity duration-1000 ${
          animationComplete ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-center px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-4">K41n3w Dev Notes</h1>
          <p className="text-xl text-red-400">Ruby on Rails, inteligência artificial e além.</p>
        </div>
      </div>
      <div className="absolute bottom-0 w-full flex justify-center pb-4">
        <ArrowDown className="h-8 w-8 text-red-500 animate-bounce" />
      </div>
    </>
  )
}
