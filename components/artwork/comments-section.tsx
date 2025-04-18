"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useSupabase } from "@/components/supabase-provider"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Send, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface CommentsProps {
  artworkId: string
}

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    name: string
    avatar_url: string | null
  }
}

export function CommentsSection({ artworkId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useSupabase()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          id,
          content,
          created_at,
          user_id,
          profiles (
            name,
            avatar_url
          )
        `,
        )
        .eq("artwork_id", artworkId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching comments:", error)
      } else {
        setComments(data || [])
      }
      setIsLoading(false)
    }

    fetchComments()

    // Set up real-time subscription
    const subscription = supabase
      .channel(`comments:${artworkId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `artwork_id=eq.${artworkId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch the new comment with profile info
            supabase
              .from("comments")
              .select(
                `
                id,
                content,
                created_at,
                user_id,
                profiles (
                  name,
                  avatar_url
                )
              `,
              )
              .eq("id", payload.new.id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setComments((prev) => [data, ...prev])
                }
              })
          } else if (payload.eventType === "DELETE") {
            setComments((prev) => prev.filter((comment) => comment.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [artworkId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment",
      })
      router.push(`/login?redirectTo=/artwork/${artworkId}`)
      return
    }

    if (!newComment.trim()) return

    setIsSubmitting(true)

    try {
      const { error } = await supabase.from("comments").insert({
        artwork_id: artworkId,
        user_id: user.id,
        content: newComment.trim(),
      })

      if (error) throw error

      setNewComment("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase.from("comments").delete().eq("id", commentId)

      if (error) throw error

      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days !== 1 ? "s" : ""} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Comments ({comments.length})</h3>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px] flex-1"
        />
        <Button type="submit" size="icon" disabled={isSubmitting || !newComment.trim()}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Link href={`/profile/${comment.user_id}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profiles.avatar_url || "/placeholder.svg"} alt={comment.profiles.name} />
                  <AvatarFallback>{comment.profiles.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link href={`/profile/${comment.user_id}`} className="font-medium hover:underline">
                      {comment.profiles.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                  </div>
                  {user && user.id === comment.user_id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete comment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this comment? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(comment.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center py-8 text-muted-foreground">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  )
}
