"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface LikeButtonProps {
  artworkId: string
  initialLikeCount?: number
  initialLiked?: boolean
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function LikeButton({
  artworkId,
  initialLikeCount = 0,
  initialLiked = false,
  size = "sm",
  variant = "outline",
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useSupabase()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!user) return

    const checkIfLiked = async () => {
      const { data, error } = await supabase
        .from("likes")
        .select("id")
        .eq("artwork_id", artworkId)
        .eq("user_id", user.id)
        .single()

      if (!error && data) {
        setIsLiked(true)
      }
    }

    const getLikeCount = async () => {
      const { count, error } = await supabase.from("likes").select("id", { count: "exact" }).eq("artwork_id", artworkId)

      if (!error) {
        setLikeCount(count || 0)
      }
    }

    checkIfLiked()
    getLikeCount()
  }, [artworkId, user, supabase])

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like artworks",
      })
      router.push(`/login?redirectTo=/artwork/${artworkId}`)
      return
    }

    setIsLoading(true)

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase.from("likes").delete().eq("artwork_id", artworkId).eq("user_id", user.id)

        if (error) throw error

        setIsLiked(false)
        setLikeCount((prev) => Math.max(0, prev - 1))
      } else {
        // Like
        const { error } = await supabase.from("likes").insert({
          artwork_id: artworkId,
          user_id: user.id,
        })

        if (error) throw error

        setIsLiked(true)
        setLikeCount((prev) => prev + 1)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={isLiked ? "default" : variant}
      size={size}
      className="flex items-center gap-2"
      onClick={handleLike}
      disabled={isLoading}
    >
      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
      <span>
        {likeCount > 0 ? likeCount : ""} Like{likeCount !== 1 ? "s" : ""}
      </span>
    </Button>
  )
}
