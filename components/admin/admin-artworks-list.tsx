"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Loader2, MoreHorizontal, Search, Eye, Trash, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import Image from "next/image"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

export function AdminArtworksList() {
  const [artworks, setArtworks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingArtwork, setDeletingArtwork] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchArtworks()
  }, [])

  const fetchArtworks = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("artworks")
        .select(`
          *,
          profiles:user_id(username, full_name),
          likes:likes(id),
          comments:comments(id)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      setArtworks(data || [])
    } catch (error) {
      console.error("Error fetching artworks:", error)
      toast({
        title: "Error",
        description: "Failed to load artworks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const filteredArtworks = artworks.filter(
    (artwork) =>
      artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artwork.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artwork.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artwork.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleViewArtwork = (artwork: any) => {
    setSelectedArtwork(artwork)
  }

  const handleDeletePrompt = (artwork: any) => {
    setSelectedArtwork(artwork)
    setDeleteDialogOpen(true)
  }

  const handleDeleteArtwork = async () => {
    if (!selectedArtwork) return

    setDeletingArtwork(true)
    try {
      // Delete likes
      await supabase.from("likes").delete().eq("artwork_id", selectedArtwork.id)

      // Delete comments
      await supabase.from("comments").delete().eq("artwork_id", selectedArtwork.id)

      // Delete artwork
      const { error } = await supabase.from("artworks").delete().eq("id", selectedArtwork.id)

      if (error) throw error

      // Remove from local state
      setArtworks(artworks.filter((a) => a.id !== selectedArtwork.id))

      toast({
        title: "Artwork deleted",
        description: "The artwork has been successfully removed.",
      })

      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting artwork:", error)
      toast({
        title: "Error",
        description: "Failed to delete artwork. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingArtwork(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Manage Artworks</h3>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search artworks..." className="pl-8" value={searchQuery} onChange={handleSearch} />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArtworks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No artworks found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArtworks.map((artwork) => (
                    <TableRow key={artwork.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md overflow-hidden relative">
                            <Image
                              src={artwork.image_url || "/placeholder.svg?height=40&width=40"}
                              alt={artwork.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="truncate max-w-[200px]">{artwork.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{artwork.profiles?.username || "Unknown"}</TableCell>
                      <TableCell>{formatDate(artwork.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-3">
                          <Badge variant="outline" className="flex gap-1 items-center">
                            <span>❤️</span> {artwork.likes?.length || 0}
                          </Badge>
                          <Badge variant="outline" className="flex gap-1 items-center">
                            <span>💬</span> {artwork.comments?.length || 0}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewArtwork(artwork)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/artwork/${artwork.id}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" />
                                View on site
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeletePrompt(artwork)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete artwork
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Artwork Details Dialog */}
      {selectedArtwork && (
        <Dialog open={!!selectedArtwork && !deleteDialogOpen} onOpenChange={() => setSelectedArtwork(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedArtwork.title}</DialogTitle>
              <DialogDescription>
                By {selectedArtwork.profiles?.full_name || selectedArtwork.profiles?.username || "Unknown artist"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative aspect-square rounded-md overflow-hidden">
                <Image
                  src={selectedArtwork.image_url || "/placeholder.svg?height=400&width=400"}
                  alt={selectedArtwork.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                  <p>{selectedArtwork.description || "No description provided."}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Medium</h4>
                  <p>{selectedArtwork.medium || "Not specified"}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Dimensions</h4>
                  <p>{selectedArtwork.dimensions || "Not specified"}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Year</h4>
                  <p>{selectedArtwork.year || "Not specified"}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Price</h4>
                  <p>{selectedArtwork.price ? `R${selectedArtwork.price}` : "Not for sale"}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Created</h4>
                  <p>{formatDate(selectedArtwork.created_at)}</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedArtwork(null)}>
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setSelectedArtwork(selectedArtwork)
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Artwork
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Artwork</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this artwork? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedArtwork && (
            <div className="flex items-center gap-4 py-2">
              <div className="h-16 w-16 relative rounded-md overflow-hidden">
                <Image
                  src={selectedArtwork.image_url || "/placeholder.svg?height=64&width=64"}
                  alt={selectedArtwork.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium">{selectedArtwork.title}</h4>
                <p className="text-sm text-muted-foreground">By {selectedArtwork.profiles?.username || "Unknown"}</p>
              </div>
            </div>
          )}

          <div className="bg-destructive/10 text-destructive rounded-md p-3 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-medium">Warning</p>
              <p className="text-sm">This will permanently delete the artwork and all associated likes and comments.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteArtwork} disabled={deletingArtwork}>
              {deletingArtwork && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Artwork
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
