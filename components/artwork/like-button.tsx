"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { likeOperations } from "@/lib/supabase-utils"

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

  useEffect(() => {
    if (!user) return

    const checkIfLiked = async () => {
      const hasLiked = await likeOperations.hasLiked(user.id, artworkId)
      setIsLiked(hasLiked)
    }

    checkIfLiked()
  }, [artworkId, user])

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
        const success = await likeOperations.remove(user.id, artworkId)
        if (success) {
          setIsLiked(false)
          setLikeCount((prev) => Math.max(0, prev - 1))
        }
      } else {
        // Like
        const success = await likeOperations.add(user.id, artworkId)
        if (success) {
          setIsLiked(true)
          setLikeCount((prev) => prev + 1)
        }
      }

      // Refresh the page to update the UI
      router.refresh()
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
