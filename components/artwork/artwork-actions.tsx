"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Heart, MessageSquare, Share2, Edit, Trash2, Loader2 } from "lucide-react"

interface ArtworkActionsProps {
  artwork: any
  isOwner: boolean
}

export function ArtworkActions({ artwork, isOwner }: ArtworkActionsProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLike = () => {
    setIsLiked(!isLiked)
    // TODO: Implement like functionality with Supabase
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: artwork.title,
        text: `Check out this artwork: ${artwork.title}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Artwork link copied to clipboard",
      })
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase.from("artworks").delete().eq("id", artwork.id)

      if (error) {
        throw error
      }

      toast({
        title: "Artwork deleted",
        description: "Your artwork has been successfully deleted.",
      })

      router.push(`/profile/${artwork.user_id}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={isLiked ? "default" : "outline"} size="sm" className="flex-1" onClick={handleLike}>
          <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          Like
        </Button>

        <Button variant="outline" size="sm" className="flex-1">
          <MessageSquare className="mr-2 h-4 w-4" />
          Comment
        </Button>

        <Button variant="outline" size="sm" className="flex-1" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>

      {isOwner && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => router.push(`/artwork/${artwork.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>

          <Button variant="destructive" size="sm" className="flex-1" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Artwork</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this artwork? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
