"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "@/lib/supabase/actions"
import { useToast } from "@/hooks/use-toast"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)

      const result = await signIn(formData)

      if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login")
      setLoading(false)

      toast({
        title: "Login Failed",
        description: err.message || "An error occurred during login",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="p-4">
        <Link href="/" className="inline-flex items-center text-red-500 hover:text-red-400">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800 text-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-red-500">Admin Login</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-900/50 border border-red-800 text-red-300 rounded-md text-sm">{error}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 focus:border-red-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800 border-gray-700 focus:border-red-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-gray-700 bg-gray-800 text-red-500 focus:ring-red-500"
                  />
                  <Label htmlFor="remember" className="text-sm font-normal">
                    Remember me
                  </Label>
                </div>
                <Link href="/admin/forgot-password" className="text-sm text-red-500 hover:text-red-400">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="border-t border-gray-800 pt-4">
            <p className="text-sm text-gray-400 text-center w-full">
              Note: You need to create an admin account in Supabase first
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
