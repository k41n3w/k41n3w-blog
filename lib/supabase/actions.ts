"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { TABLES } from "./config"
import type { Database } from "./database.types"

// Create a Supabase client for server actions
const createClient = () => {
  const cookieStore = cookies()
  return createServerActionClient<Database>({ cookies: () => cookieStore })
}

// Authentication actions
export async function signIn(formData: FormData) {
  const supabase = createClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  redirect("/admin/dashboard")
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath("/")
  redirect("/")
}

// Post actions
export async function createPost(formData: FormData) {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

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

    if (postError) throw postError

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
            post_id: post.id,
            tag_id: tag.id,
          })
        }
      }
    }

    revalidatePath("/admin/dashboard")
    revalidatePath("/")
    return { success: true, id: post.id }
  } catch (error: any) {
    return { error: error.message || "Failed to create post" }
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
  const supabase = createClient()

  try {
    const { error } = await supabase.from(TABLES.POSTS).delete().eq("id", postId)

    if (error) throw error

    revalidatePath("/admin/dashboard")
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to delete post" }
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
