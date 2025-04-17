"use client"

import type React from "react"

import { useEffect } from "react"

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  // Efeito para rolar para o topo quando o layout for montado
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return <>{children}</>
}
