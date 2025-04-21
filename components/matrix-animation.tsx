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
      canvas.height = 650 // Aumentado de 500px para 650px
    }

    // Initial size
    updateCanvasSize()

    // Matrix characters - voltando ao conjunto original de caracteres
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~"
    const targetText = "k41n3w"

    // Array of character columns
    const fontSize = 15
    const spacing = 18 // Mantendo o espaçamento reduzido
    const columns = Math.floor(canvas.width / spacing)
    const drops: number[] = []
    const speeds: number[] = [] // Velocidades variadas para cada coluna
    const maxLengths: number[] = [] // Comprimentos máximos variados para cada coluna
    const opacities: number[] = [] // Opacidades para fade-out
    const active: boolean[] = [] // Controle de colunas ativas
    const initialSpeeds: number[] = [] // Velocidades iniciais para referência

    // Initialize drops with random starting positions and properties
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100
      // Velocidade inicial mais alta
      const initialSpeed = 1 + Math.random() * 2 // Entre 1 e 3
      speeds[i] = initialSpeed
      initialSpeeds[i] = initialSpeed // Guardar velocidade inicial
      maxLengths[i] = Math.random() * canvas.height * 0.7 + canvas.height * 0.3 // Entre 30% e 100% da altura
      opacities[i] = 1
      active[i] = true
    }

    // Text to display at the end
    let displayedText = ""
    let textTimer = 0
    let finalTextDisplayed = false
    let animationStartTime = Date.now()

    // Draw function
    function draw() {
      // Semi-transparent black background for trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Calcular o tempo decorrido desde o início da animação (em segundos)
      const elapsedTime = (Date.now() - animationStartTime) / 1000

      // Contar colunas ativas
      let activeCount = 0

      // Draw falling characters
      for (let i = 0; i < drops.length; i++) {
        // Skip if this column is no longer active
        if (!active[i]) {
          // Reativar aleatoriamente algumas colunas para manter o efeito contínuo
          if (Math.random() > 0.995) {
            drops[i] = Math.random() * -20
            opacities[i] = 1
            active[i] = true
            // Velocidade reduzida para colunas reativadas após o texto aparecer
            speeds[i] = animationComplete
              ? initialSpeeds[i] * 0.3 + Math.random() * 0.2
              : // Velocidade muito reduzida após completar
                initialSpeeds[i] * 0.7 + Math.random() * 0.3 // Velocidade moderada antes de completar
          }
          continue
        }

        activeCount++

        // Ajustar velocidade ao longo do tempo - desaceleração gradual
        if (elapsedTime > 3 && speeds[i] > 0.2) {
          speeds[i] *= 0.9995 // Desacelerar muito gradualmente
        }

        ctx.fillStyle = `rgba(255, 0, 0, ${opacities[i]})`
        ctx.font = `${fontSize}px monospace`

        // Random character
        const text = characters.charAt(Math.floor(Math.random() * characters.length))

        // x coordinate of the drop
        const x = i * spacing
        // y coordinate of the drop
        const y = drops[i] * fontSize

        // Only draw if within canvas bounds
        if (y > 0 && y < canvas.height) {
          ctx.fillText(text, x, y)
        }

        // Check if this column has reached its max length
        if (drops[i] * fontSize > maxLengths[i]) {
          // Start fading out
          opacities[i] -= 0.01

          // Deactivate when fully transparent
          if (opacities[i] <= 0) {
            active[i] = false
          }
        }

        // Increment y coordinate with variable speed
        drops[i] += speeds[i]
      }

      // Garantir que pelo menos 10% das colunas estejam sempre ativas
      const minActiveColumns = Math.floor(columns * 0.1)
      if (activeCount < minActiveColumns && animationComplete) {
        for (let i = 0; i < columns; i++) {
          if (!active[i] && activeCount < minActiveColumns) {
            drops[i] = Math.random() * -20
            opacities[i] = 1
            active[i] = true
            speeds[i] = initialSpeeds[i] * 0.3 + Math.random() * 0.2 // Velocidade reduzida
            activeCount++
          }
        }
      }

      // Check the current animation state using the ref
      const isAnimationComplete = animationCompleteRef.current

      // Display final text after some time, but only if animation is not complete
      if (!finalTextDisplayed && !isAnimationComplete) {
        textTimer++
        if (textTimer > 150) {
          // Voltando ao tempo original de 150
          if (displayedText.length < targetText.length) {
            displayedText = targetText.substring(0, displayedText.length + 1)
          } else {
            finalTextDisplayed = true
            setTimeout(() => {
              setAnimationComplete(true)
            }, 1000) // Voltando ao tempo original de 1000ms
          }
        }

        if (displayedText.length > 0) {
          ctx.font = "bold 48px monospace" // Mantendo o tamanho aumentado da fonte
          ctx.fillStyle = "#ff0000"
          const textWidth = ctx.measureText(displayedText).width
          ctx.fillText(displayedText, (canvas.width - textWidth) / 2, canvas.height / 2)
        }
      } else if (finalTextDisplayed && !isAnimationComplete) {
        // Keep displaying the final text until animation is complete
        ctx.font = "bold 48px monospace" // Mantendo o tamanho aumentado da fonte
        ctx.fillStyle = "#ff0000"
        const textWidth = ctx.measureText(targetText).width
        ctx.fillText(targetText, (canvas.width - textWidth) / 2, canvas.height / 2)

        // Removido o efeito de pulsação
      }

      // Continue animation
      requestAnimationFrame(draw)
    }

    // Start the animation
    animationStartTime = Date.now()
    draw()

    // Handle window resize
    const handleResize = () => {
      updateCanvasSize()
      // Recalculate columns and drops on resize
      const newColumns = Math.floor(canvas.width / spacing)

      // Adjust drops array if needed
      if (newColumns > drops.length) {
        // Add new drops if canvas got wider
        for (let i = drops.length; i < newColumns; i++) {
          drops.push(Math.random() * -100)
          const initialSpeed = 1 + Math.random() * 2
          speeds.push(initialSpeed)
          initialSpeeds.push(initialSpeed)
          maxLengths.push(Math.random() * canvas.height * 0.7 + canvas.height * 0.3)
          opacities.push(1)
          active.push(true)
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
          <h1 className="text-3xl md:text-5xl font-bold text-red-600 mb-4">K41n3w Dev Notes</h1>
          <p className="text-xl text-red-400">Ruby on Rails, inteligência artificial e além.</p>
        </div>
      </div>
      <div className="absolute bottom-0 w-full flex justify-center pb-4">
        <ArrowDown className="h-8 w-8 text-red-500 animate-bounce" />
      </div>
    </>
  )
}
