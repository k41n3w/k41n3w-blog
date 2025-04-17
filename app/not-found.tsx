import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">404 - Página não encontrada</h1>
        <p className="text-gray-400 mb-8">A página que você está procurando não existe ou foi movida.</p>
        <Link href="/">
          <Button className="bg-red-600 hover:bg-red-700">Voltar para a página inicial</Button>
        </Link>
      </div>
    </div>
  )
}
