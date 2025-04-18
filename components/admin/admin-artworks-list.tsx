"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Eye, Trash2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Artwork {
  id: string
  title: string
  description: string
  image_url: string
  user_id: string
  price: number
  currency: string
  medium: string
  created_at: string
  profiles: {
    name: string
    email: string
  }
  likes_count?: number
  comments_count?: number
}

export function AdminArtworksList() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [artworkToDelete, setArtworkToDelete] = useState<Artwork | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchArtworks()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredArtworks(artworks)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = artworks.filter(
        (artwork) =>
          artwork.title.toLowerCase().includes(query) ||
          artwork.profiles.name.toLowerCase().includes(query) ||
          artwork.medium.toLowerCase().includes(query),
      )
      setFilteredArtworks(filtered)
    }
  }, [searchQuery, artworks])

  const fetchArtworks = async () => {
    try {
      setIsLoading(true)

      // Fetch artworks with profile information
      const { data: artworksData, error: artworksError } = await supabase
        .from("artworks")
        .select(`
          id, title, description, image_url, user_id, price, currency, medium, created_at,
          profiles:user_id (name, email)
        `)
        .order("created_at", { ascending: false })

      if (artworksError) {
        console.error("Error fetching artworks:", artworksError)
        return
      }

      // Fetch likes count for each artwork
      const { data: likesData, error: likesError } = await supabase.from("likes").select("artwork_id")

      if (likesError) {
        console.error("Error fetching likes:", likesError)
      }

      // Count likes per artwork
      const likesCount: Record<string, number> = {}
      likesData?.forEach((like) => {
        if (like.artwork_id) {
          likesCount[like.artwork_id] = (likesCount[like.artwork_id] || 0) + 1
        }
      })

      // Fetch comments count for each artwork
      const { data: commentsData, error: commentsError } = await supabase.from("comments").select("artwork_id")

      if (commentsError) {
        console.error("Error fetching comments:", commentsError)
      }

      // Count comments per artwork
      const commentsCount: Record<string, number> = {}
      commentsData?.forEach((comment) => {
        if (comment.artwork_id) {
          commentsCount[comment.artwork_id] = (commentsCount[comment.artwork_id] || 0) + 1
        }
      })

      // Combine all data
      const artworksWithCounts =
        artworksData?.map((artwork) => ({
          ...artwork,
          likes_count: likesCount[artwork.id] || 0,
          comments_count: commentsCount[artwork.id] || 0,
        })) || []

      setArtworks(artworksWithCounts)
      setFilteredArtworks(artworksWithCounts)
    } catch (error) {
      console.error("Error in fetchArtworks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (artwork: Artwork) => {
    setArtworkToDelete(artwork)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!artworkToDelete) return

    try {
      setIsDeleting(true)

      // Delete likes associated with the artwork
      await supabase.from("likes").delete().eq("artwork_id", artworkToDelete.id)

      // Delete comments associated with the artwork
      await supabase.from("comments").delete().eq("artwork_id", artworkToDelete.id)

      // Delete the artwork
      const { error } = await supabase.from("artworks").delete().eq("id", artworkToDelete.id)

      if (error) {
        console.error("Error deleting artwork:", error)
        return
      }

      // Remove the artwork from the state
      setArtworks(artworks.filter((a) => a.id !== artworkToDelete.id))
      setFilteredArtworks(filteredArtworks.filter((a) => a.id !== artworkToDelete.id))

      // Log the admin action
      await supabase.from("admin_logs").insert({
        action: "delete_artwork",
        resource_id: artworkToDelete.id,
        details: `Deleted artwork: ${artworkToDelete.title}`,
      })
    } catch (error) {
      console.error("Error in handleDeleteConfirm:", error)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setArtworkToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatPrice = (price: number, currency: string) => {
    if (!price) return "Price on request"

    const currencySymbols: Record<string, string> = {
      ZAR: "R",
      USD: "$",
      EUR: "€",
      GBP: "£",
    }

    const symbol = currencySymbols[currency] || currency
    return `${symbol}${price.toLocaleString()}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Manage Artworks</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search artworks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredArtworks.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artwork</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Medium</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArtworks.map((artwork) => (
                <TableRow key={artwork.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded">
                        <Image
                          src={artwork.image_url || "/placeholder.svg?height=40&width=40"}
                          alt={artwork.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="font-medium">{artwork.title}</div>
                    </div>
                  </TableCell>
                  <TableCell>{artwork.profiles?.name || "Unknown Artist"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{artwork.medium}</Badge>
                  </TableCell>
                  <TableCell>
                    {artwork.price ? formatPrice(artwork.price, artwork.currency || "ZAR") : "Price on request"}
                  </TableCell>
                  <TableCell>{formatDate(artwork.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs">{artwork.likes_count} likes</span>
                      <span className="text-xs">{artwork.comments_count} comments</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/artwork/${artwork.id}`} target="_blank">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(artwork)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex justify-center py-8 text-muted-foreground">
          <p>No artworks found</p>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the artwork "{artworkToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Artwork"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
