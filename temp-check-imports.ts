"use client"

// Este arquivo é temporário e será removido após a verificação
// Ele serve apenas para verificar se há alguma importação de useEffectEvent

// Importações comuns que podem estar sendo usadas
import { useEffect, useState } from "react"

// Não importar useEffectEvent diretamente do React
// import { useEffectEvent } from "react" // Esta linha causaria o erro

// Em vez disso, usar nossa implementação personalizada
import { useEffectEvent } from "./hooks/use-effect-event"

// Exemplo de uso
function ExampleComponent() {
  const [count, setCount] = useState(0)

  // Usar nossa implementação personalizada
  const onCount = useEffectEvent((newCount: number) => {
    console.log(`Count changed to ${newCount}`)
  })

  useEffect(() => {
    onCount(count)
  }, [count])

  return <button onClick={() => setCount(count + 1)}>Increment</button>
}
