"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"

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

    // Set canvas dimensions - mantendo a altura em 700px
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = 700
    }

    // Initial size
    updateCanvasSize()

    // Matrix characters
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~"
    const targetText = "k41n3w"

    // Array of character columns - voltando para o espaçamento original de 20px
    const columnSpacing = 20 // Voltando para 20px conforme solicitado
    const columns = Math.floor(canvas.width / columnSpacing)
    const drops: number[] = []
    const speeds: number[] = [] // Different speeds for each column
    const maxLengths: number[] = [] // Different max lengths for each column
    const densities: number[] = [] // Densidade de caracteres por coluna (probabilidade de desenhar)

    // Initialize drops with varying properties
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100

      // Velocidades variadas (0.3 a 2.0)
      speeds[i] = 0.3 + Math.random() * 1.7

      // Comprimentos máximos variados (10 a 35) - voltando ao original
      maxLengths[i] = 10 + Math.floor(Math.random() * 25)

      // Densidade variada (30% a 80% de chance de desenhar um caractere)
      densities[i] = 0.3 + Math.random() * 0.5
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
        // Decidir se desenha um caractere nesta posição com base na densidade
        const shouldDraw = Math.random() < densities[i]

        if (shouldDraw) {
          // Random character
          const text = characters.charAt(Math.floor(Math.random() * characters.length))

          // x coordinate of the drop
          const x = i * columnSpacing
          // y coordinate of the drop
          const y = drops[i] * 20

          // Desenhar o caractere
          ctx.fillText(text, x, y)
        }

        // Increment y coordinate with varying speed
        drops[i] += speeds[i]

        // Reset the drop back to the top when it reaches its maximum length
        // or goes off screen, but continue the animation indefinitely
        const maxY = maxLengths[i] * 20
        if (drops[i] * 20 > canvas.height || drops[i] * 20 > maxY) {
          // Reset to slightly above the top of the screen for continuous animation
          drops[i] = -1 - Math.random() * 5 // Valores negativos para começar acima da tela

          // Randomize properties again for variety
          speeds[i] = 0.3 + Math.random() * 1.7
          maxLengths[i] = 10 + Math.floor(Math.random() * 25) // Voltando para 10-35
          densities[i] = 0.3 + Math.random() * 0.5
        }
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
      const newColumns = Math.floor(canvas.width / columnSpacing)

      // Adjust drops array if needed
      if (newColumns > drops.length) {
        // Add new drops if canvas got wider
        for (let i = drops.length; i < newColumns; i++) {
          drops.push(Math.random() * -100)
          speeds.push(0.3 + Math.random() * 1.7)
          maxLengths.push(10 + Math.floor(Math.random() * 25)) // Voltando para 10-35
          densities.push(0.3 + Math.random() * 0.5)
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
          <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-4">Vamos compartilhar conhecimento</h1>
          <p className="text-xl text-red-400">Falando de tecnologia?</p>
        </div>
      </div>
      <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-bounce">
        <ChevronDown size={48} className="text-red-600" />
      </div>
    </>
  )
}
