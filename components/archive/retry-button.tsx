"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function RetryButton() {
  return (
    <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
      <RefreshCw className="mr-2 h-4 w-4" />
      Tentar novamente
    </Button>
  )
}
