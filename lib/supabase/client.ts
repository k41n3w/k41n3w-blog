"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

// Create a single instance of the Supabase client for client components
export const createClient = () => {
  return createClientComponentClient<Database>()
}
