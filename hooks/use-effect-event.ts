"use client"

import { useCallback } from "react"

// This is a custom implementation of useEffectEvent
// It uses useCallback with an empty dependency array as a workaround
export function useEffectEvent<T extends (...args: any[]) => any>(callback: T): T {
  return useCallback(callback, []) as T
}
