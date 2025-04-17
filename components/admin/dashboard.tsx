"use client"

import { useState } from "react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import { PlusCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import PostsList from "./posts-list"
import CommentsList from "./comments-list"

interface AdminDashboardProps {
  user: User | null
  posts: any[]
  pendingComments: any[]
}

export default function AdminDashboard({ user, posts, pendingComments }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("posts")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      // Usar diretamente o cliente Supabase para logout
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      toast({
        title: "Logout bem-sucedido",
        description: "Você foi desconectado com sucesso.",
      })

      // Usar window.location para um redirecionamento mais forte
      window.location.href = "/"
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error)
      toast({
        title: "Erro",
        description: "Não foi possível fazer logout. Tente novamente.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-red-500">Painel Administrativo</h1>
            <p className="text-gray-400">Logado como {user?.email || "Usuário"}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/admin/posts/new">
              <Button className="bg-red-600 hover:bg-red-700 flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Post
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-red-600 text-red-600"
              onClick={handleSignOut}
              disabled={isLoading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoading ? "Saindo..." : "Sair"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-gray-900 border-gray-800">
            <TabsTrigger value="posts" className="data-[state=active]:bg-red-600">
              Posts ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:bg-red-600">
              Comentários Pendentes ({pendingComments.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-6">
            <PostsList posts={posts} />
          </TabsContent>
          <TabsContent value="comments" className="mt-6">
            <CommentsList comments={pendingComments} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="py-4 bg-gray-900 border-t border-gray-800 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} k41n3w. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
