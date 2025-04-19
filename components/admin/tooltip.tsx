"use client"

import type React from "react"
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
}

export function Tooltip({ children, content }: TooltipProps) {
  return (
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  )
}
