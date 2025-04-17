"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { TABLES } from "./config"
import type { Database } from "./database.types"

// Create a Supabase client for server actions
const createClient = () => {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name, options) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    },
  )
}

// Authentication actions
export async function signIn(formData: FormData) {
  const supabase = createClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  console.log("Tentando login com:", email)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Login error:", error.message)
    return { error: error.message, success: false }
  }

  // Ensure we have a user before considering it a success
  if (data?.user) {
    console.log("Login bem-sucedido para:", data.user.email)
    console.log("Session:", !!data.session)

    // Revalidate paths
    revalidatePath("/admin/dashboard")

    // Return success and the URL to redirect to
    return {
      success: true,
      redirectUrl: "/admin/dashboard",
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    }
  }

  return { success: false, error: "Login falhou" }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath("/")
  // Return the URL to redirect to instead of redirecting
  return { success: true, redirectUrl: "/" }
}

// Post actions
export async function createPost(formData: FormData) {
  console.log("Iniciando createPost")
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  console.log("Usuário atual:", user?.email)

  if (userError) {
    console.error("Erro ao obter usuário:", userError)
    return { error: "Erro ao obter usuário: " + userError.message }
  }

  if (!user) {
    console.error("Usuário não autenticado")
    return { error: "Não autenticado" }
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const excerpt = formData.get("excerpt") as string
  const status = formData.get("status") as string
  const tagsInput = formData.get("tags") as string

  console.log("Dados do formulário:", { title, excerpt, status, tagsLength: tagsInput?.length || 0 })
  console.log("Conteúdo (primeiros 100 caracteres):", content?.substring(0, 100))

  const tags = tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)

  try {
    console.log("Inserindo post no banco de dados")
    // Insert the post
    const { data: post, error: postError } = await supabase
      .from(TABLES.POSTS)
      .insert({
        title,
        content,
        excerpt,
        author_id: user.id, // Use the authenticated user's ID
        status,
        published_at: status === "Published" ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (postError) {
      console.error("Erro ao inserir post:", postError)
      throw postError
    }

    console.log("Post inserido com sucesso:", post.id)

    // Handle tags
    if (tags.length > 0) {
      console.log("Processando tags:", tags)
      // First, ensure all tags exist
      for (const tagName of tags) {
        if (!tagName) continue

        // Check if tag exists
        const { data: existingTag, error: tagCheckError } = await supabase
          .from(TABLES.TAGS)
          .select("id")
          .eq("name", tagName)
          .single()

        if (tagCheckError && tagCheckError.code !== "PGRST116") {
          // PGRST116 é o código para "não encontrado"
          console.error("Erro ao verificar tag:", tagCheckError)
        }

        if (!existingTag) {
          console.log("Criando nova tag:", tagName)
          // Create new tag
          const { error: tagCreateError } = await supabase.from(TABLES.TAGS).insert({ name: tagName })
          if (tagCreateError) {
            console.error("Erro ao criar tag:", tagCreateError)
          }
        }
      }

      // Then link tags to post
      for (const tagName of tags) {
        if (!tagName) continue

        const { data: tag, error: tagFetchError } = await supabase
          .from(TABLES.TAGS)
          .select("id")
          .eq("name", tagName)
          .single()

        if (tagFetchError) {
          console.error("Erro ao buscar tag:", tagFetchError)
          continue
        }

        if (tag) {
          console.log("Vinculando tag ao post:", tagName)
          const { error: linkError } = await supabase.from(TABLES.POST_TAGS).insert({
            post_id: post.id,
            tag_id: tag.id,
          })

          if (linkError) {
            console.error("Erro ao vincular tag ao post:", linkError)
          }
        }
      }
    }

    console.log("Post criado com sucesso, revalidando caminhos")
    revalidatePath("/admin/dashboard")
    revalidatePath("/")
    return { success: true, id: post.id }
  } catch (error: any) {
    console.error("Erro ao criar post:", error)
    return { error: error.message || "Falha ao criar post" }
  }
}

export async function updatePost(postId: string, formData: FormData) {
  const supabase = createClient()

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const excerpt = formData.get("excerpt") as string
  const status = formData.get("status") as string
  const tagsInput = formData.get("tags") as string
  const tags = tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)

  try {
    // Update the post
    const { error: postError } = await supabase
      .from(TABLES.POSTS)
      .update({
        title,
        content,
        excerpt,
        status,
        published_at: status === "Published" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)

    if (postError) throw postError

    // Remove existing tag associations
    await supabase.from(TABLES.POST_TAGS).delete().eq("post_id", postId)

    // Handle tags
    if (tags.length > 0) {
      // First, ensure all tags exist
      for (const tagName of tags) {
        if (!tagName) continue

        // Check if tag exists
        const { data: existingTag } = await supabase.from(TABLES.TAGS).select("id").eq("name", tagName).single()

        if (!existingTag) {
          // Create new tag
          await supabase.from(TABLES.TAGS).insert({ name: tagName })
        }
      }

      // Then link tags to post
      for (const tagName of tags) {
        if (!tagName) continue

        const { data: tag } = await supabase.from(TABLES.TAGS).select("id").eq("name", tagName).single()

        if (tag) {
          await supabase.from(TABLES.POST_TAGS).insert({
            post_id: postId,
            tag_id: tag.id,
          })
        }
      }
    }

    revalidatePath(`/posts/${postId}`)
    revalidatePath("/admin/dashboard")
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to update post" }
  }
}

export async function deletePost(postId: string) {
  console.log("Iniciando deletePost para ID:", postId)
  const supabase = createClient()

  try {
    // Primeiro, remover as associações de tags
    console.log("Removendo associações de tags")
    const { error: tagDeleteError } = await supabase.from(TABLES.POST_TAGS).delete().eq("post_id", postId)

    if (tagDeleteError) {
      console.error("Erro ao remover associações de tags:", tagDeleteError)
      // Continuar mesmo com erro, para tentar excluir o post
    }

    // Depois, remover os comentários
    console.log("Removendo comentários")
    const { error: commentDeleteError } = await supabase.from(TABLES.COMMENTS).delete().eq("post_id", postId)

    if (commentDeleteError) {
      console.error("Erro ao remover comentários:", commentDeleteError)
      // Continuar mesmo com erro, para tentar excluir o post
    }

    // Finalmente, excluir o post
    console.log("Excluindo o post")
    const { error } = await supabase.from(TABLES.POSTS).delete().eq("id", postId)

    if (error) {
      console.error("Erro ao excluir post:", error)
      throw error
    }

    console.log("Post excluído com sucesso")
    // Revalidar caminhos relevantes
    revalidatePath("/admin/dashboard")
    revalidatePath("/")
    revalidatePath("/archive")

    return { success: true }
  } catch (error: any) {
    console.error("Exceção ao excluir post:", error)
    return { error: error.message || "Falha ao excluir post" }
  }
}

// Comment actions
export async function createComment(formData: FormData) {
  const supabase = createClient()

  const postId = formData.get("postId") as string
  const author = formData.get("author") as string
  const email = formData.get("email") as string
  const content = formData.get("content") as string

  try {
    const { error } = await supabase.from(TABLES.COMMENTS).insert({
      post_id: postId,
      author,
      author_email: email || null,
      content,
      status: "Pending", // All comments start as pending
    })

    if (error) throw error

    revalidatePath(`/posts/${postId}`)
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to create comment" }
  }
}

export async function approveComment(commentId: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from(TABLES.COMMENTS)
      .update({ status: "Approved" })
      .eq("id", commentId)
      .select("post_id")
      .single()

    if (error) throw error

    revalidatePath(`/posts/${data.post_id}`)
    revalidatePath("/admin/dashboard")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to approve comment" }
  }
}

export async function deleteComment(commentId: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from(TABLES.COMMENTS).delete().eq("id", commentId).select("post_id").single()

    if (error) throw error

    revalidatePath(`/posts/${data.post_id}`)
    revalidatePath("/admin/dashboard")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to delete comment" }
  }
}

// Like actions
export async function incrementPostLikes(postId: string) {
  const supabase = createClient()

  try {
    // Call the RPC function
    const { error } = await supabase.rpc("increment_post_likes", {
      post_id: postId,
    })

    if (error) throw error

    revalidatePath(`/posts/${postId}`)
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to like post" }
  }
}

export async function incrementCommentLikes(commentId: string) {
  const supabase = createClient()

  try {
    // Call the RPC function
    const { error } = await supabase.rpc("increment_comment_likes", {
      comment_id: commentId,
    })

    if (error) throw error

    // Get the post ID to revalidate the path
    const { data, error: fetchError } = await supabase
      .from(TABLES.COMMENTS)
      .select("post_id")
      .eq("id", commentId)
      .single()

    if (fetchError) throw fetchError

    revalidatePath(`/posts/${data.post_id}`)
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to like comment" }
  }
}
