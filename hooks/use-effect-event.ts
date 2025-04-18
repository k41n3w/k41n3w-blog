"use client"

// Este arquivo é apenas para verificar se há alguma importação de useEffectEvent
// Vamos substituir qualquer uso de useEffectEvent por uma alternativa compatível

import { useCallback } from "react"

// Substituir useEffectEvent por useCallback
export function useEffectEvent<T extends (...args: any[]) => any>(callback: T): T {
  return useCallback(callback, []) as T
}
