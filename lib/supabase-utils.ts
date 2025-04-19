import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"

// Create a type-safe Supabase client
export const createClient = () => createClientComponentClient()

// Generic error handler
export const handleError = (error: any, customMessage?: string) => {
  console.error(error)
  toast({
    title: "Error",
    description: customMessage || error.message || "Something went wrong",
    variant: "destructive",
  })
  return null
}

// Generic success handler
export const handleSuccess = (message: string) => {
  toast({
    title: "Success",
    description: message,
  })
}

// CRUD operations for artworks
export const artworkOperations = {
  // Create a new artwork
  async create(artworkData: any) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("artworks").insert(artworkData).select().single()

      if (error) throw error
      handleSuccess("Artwork created successfully")
      return data
    } catch (error) {
      return handleError(error, "Failed to create artwork")
    }
  },

  // Get a single artwork by ID
  async getById(id: string) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("artworks").select("*").eq("id", id).single()

      if (error) throw error
      return data
    } catch (error) {
      return handleError(error, "Failed to fetch artwork")
    }
  },

  // Update an artwork
  async update(id: string, updates: any) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("artworks")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      handleSuccess("Artwork updated successfully")
      return data
    } catch (error) {
      return handleError(error, "Failed to update artwork")
    }
  },

  // Delete an artwork
  async delete(id: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("artworks").delete().eq("id", id)

      if (error) throw error
      handleSuccess("Artwork deleted successfully")
      return true
    } catch (error) {
      return handleError(error, "Failed to delete artwork")
    }
  },
}

// CRUD operations for profiles
export const profileOperations = {
  // Get a profile by user ID
  async getById(id: string) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()

      if (error) throw error
      return data
    } catch (error) {
      return handleError(error, "Failed to fetch profile")
    }
  },

  // Update a profile
  async update(id: string, updates: any) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      handleSuccess("Profile updated successfully")
      return data
    } catch (error) {
      return handleError(error, "Failed to update profile")
    }
  },
}

// CRUD operations for likes
export const likeOperations = {
  // Add a like
  async add(userId: string, artworkId: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("likes").insert({ user_id: userId, artwork_id: artworkId })

      if (error) throw error
      return true
    } catch (error) {
      return handleError(error, "Failed to like artwork")
    }
  },

  // Remove a like
  async remove(userId: string, artworkId: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("likes").delete().eq("user_id", userId).eq("artwork_id", artworkId)

      if (error) throw error
      return true
    } catch (error) {
      return handleError(error, "Failed to unlike artwork")
    }
  },

  // Check if a user has liked an artwork
  async hasLiked(userId: string, artworkId: string) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", userId)
        .eq("artwork_id", artworkId)
        .single()

      if (error && error.code !== "PGRST116") throw error // PGRST116 is "no rows returned" error
      return !!data
    } catch (error) {
      console.error(error)
      return false
    }
  },
}

// CRUD operations for comments
export const commentOperations = {
  // Add a comment
  async add(commentData: any) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("comments").insert(commentData).select().single()

      if (error) throw error
      return data
    } catch (error) {
      return handleError(error, "Failed to add comment")
    }
  },

  // Delete a comment
  async delete(id: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("comments").delete().eq("id", id)

      if (error) throw error
      handleSuccess("Comment deleted successfully")
      return true
    } catch (error) {
      return handleError(error, "Failed to delete comment")
    }
  },
}

// CRUD operations for open calls
export const openCallOperations = {
  // Create a new open call
  async create(openCallData: any) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("open_calls").insert(openCallData).select().single()

      if (error) throw error
      handleSuccess("Open call created successfully")
      return data
    } catch (error) {
      return handleError(error, "Failed to create open call")
    }
  },

  // Update an open call
  async update(id: string, updates: any) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("open_calls")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      handleSuccess("Open call updated successfully")
      return data
    } catch (error) {
      return handleError(error, "Failed to update open call")
    }
  },

  // Delete an open call
  async delete(id: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("open_calls").delete().eq("id", id)

      if (error) throw error
      handleSuccess("Open call deleted successfully")
      return true
    } catch (error) {
      return handleError(error, "Failed to delete open call")
    }
  },
}

// CRUD operations for submissions
export const submissionOperations = {
  // Submit to an open call
  async submit(submissionData: any) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("open_call_submissions").insert(submissionData).select().single()

      if (error) throw error
      handleSuccess("Submission successful")
      return data
    } catch (error) {
      return handleError(error, "Failed to submit application")
    }
  },

  // Update a submission
  async updateStatus(id: string, status: "pending" | "accepted" | "rejected") {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("open_call_submissions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      handleSuccess(`Submission ${status}`)
      return data
    } catch (error) {
      return handleError(error, "Failed to update submission status")
    }
  },
}

// CRUD operations for messages
export const messageOperations = {
  // Send a message
  async send(messageData: any) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("messages").insert(messageData).select().single()

      if (error) throw error
      return data
    } catch (error) {
      return handleError(error, "Failed to send message")
    }
  },

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("messages")
        .update({ read: true })
        .eq("conversation_id", conversationId)
        .neq("user_id", userId)
        .eq("read", false)

      if (error) throw error
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },
}
