"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Loader2, MoreHorizontal, Search, Eye, Trash, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
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

export function AdminOpenCallsList() {
  const [openCalls, setOpenCalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOpenCall, setSelectedOpenCall] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingOpenCall, setDeletingOpenCall] = useState(false)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [processingApproval, setProcessingApproval] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchOpenCalls()
  }, [])

  const fetchOpenCalls = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("open_calls")
        .select(`
          *,
          organizations:organization_id(name, logo_url),
          submissions:open_call_submissions(id)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      setOpenCalls(data || [])
    } catch (error) {
      console.error("Error fetching open calls:", error)
      toast({
        title: "Error",
        description: "Failed to load open calls. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const filteredOpenCalls = openCalls.filter(
    (openCall) =>
      openCall.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      openCall.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      openCall.organizations?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleViewOpenCall = (openCall: any) => {
    setSelectedOpenCall(openCall)
  }

  const handleDeletePrompt = (openCall: any) => {
    setSelectedOpenCall(openCall)
    setDeleteDialogOpen(true)
  }

  const handleApprovalPrompt = (openCall: any) => {
    setSelectedOpenCall(openCall)
    setApprovalDialogOpen(true)
  }

  const handleDeleteOpenCall = async () => {
    if (!selectedOpenCall) return

    setDeletingOpenCall(true)
    try {
      // Delete submissions
      await supabase.from("open_call_submissions").delete().eq("open_call_id", selectedOpenCall.id)

      // Delete open call
      const { error } = await supabase.from("open_calls").delete().eq("id", selectedOpenCall.id)

      if (error) throw error

      // Remove from local state
      setOpenCalls(openCalls.filter((oc) => oc.id !== selectedOpenCall.id))

      toast({
        title: "Open call deleted",
        description: "The open call has been successfully removed.",
      })

      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting open call:", error)
      toast({
        title: "Error",
        description: "Failed to delete open call. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingOpenCall(false)
    }
  }

  const handleApproveOpenCall = async (approve: boolean) => {
    if (!selectedOpenCall) return

    setProcessingApproval(true)
    try {
      const { error } = await supabase
        .from("open_calls")
        .update({ status: approve ? "approved" : "rejected" })
        .eq("id", selectedOpenCall.id)

      if (error) throw error

      // Update in local state
      setOpenCalls(
        openCalls.map((oc) =>
          oc.id === selectedOpenCall.id ? { ...oc, status: approve ? "approved" : "rejected" } : oc,
        ),
      )

      toast({
        title: approve ? "Open call approved" : "Open call rejected",
        description: approve
          ? "The open call has been approved and is now visible to all users."
          : "The open call has been rejected and is no longer visible to users.",
      })

      setApprovalDialogOpen(false)
    } catch (error) {
      console.error("Error updating open call status:", error)
      toast({
        title: "Error",
        description: "Failed to update open call status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingApproval(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Manage Open Calls</h3>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search open calls..." className="pl-8" value={searchQuery} onChange={handleSearch} />
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
                  <TableHead>Organization</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOpenCalls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No open calls found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOpenCalls.map((openCall) => (
                    <TableRow key={openCall.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md overflow-hidden relative">
                            <Image
                              src={openCall.image_url || "/placeholder.svg?height=40&width=40"}
                              alt={openCall.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="truncate max-w-[200px]">{openCall.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{openCall.organizations?.name || "Unknown"}</TableCell>
                      <TableCell>{formatDate(openCall.deadline)}</TableCell>
                      <TableCell>{getStatusBadge(openCall.status || "pending")}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{openCall.submissions?.length || 0} submissions</Badge>
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
                            <DropdownMenuItem onClick={() => handleViewOpenCall(openCall)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/open-calls/${openCall.id}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" />
                                View on site
                              </Link>
                            </DropdownMenuItem>
                            {openCall.status === "pending" && (
                              <DropdownMenuItem onClick={() => handleApprovalPrompt(openCall)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Review approval
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeletePrompt(openCall)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete open call
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

      {/* Open Call Details Dialog */}
      {selectedOpenCall && (
        <Dialog
          open={!!selectedOpenCall && !deleteDialogOpen && !approvalDialogOpen}
          onOpenChange={() => setSelectedOpenCall(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedOpenCall.title}</DialogTitle>
              <DialogDescription>By {selectedOpenCall.organizations?.name || "Unknown organization"}</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative aspect-video rounded-md overflow-hidden">
                <Image
                  src={selectedOpenCall.image_url || "/placeholder.svg?height=300&width=400"}
                  alt={selectedOpenCall.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                  <p>{selectedOpenCall.description || "No description provided."}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Deadline</h4>
                  <p>{formatDate(selectedOpenCall.deadline)}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                  <p>{getStatusBadge(selectedOpenCall.status || "pending")}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Eligibility</h4>
                  <p>{selectedOpenCall.eligibility || "Not specified"}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Prizes</h4>
                  <p>{selectedOpenCall.prizes || "Not specified"}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Created</h4>
                  <p>{formatDate(selectedOpenCall.created_at)}</p>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setSelectedOpenCall(null)}>
                Close
              </Button>

              {selectedOpenCall.status === "pending" && (
                <Button
                  variant="default"
                  onClick={() => {
                    setApprovalDialogOpen(true)
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Review Approval
                </Button>
              )}

              <Button
                variant="destructive"
                onClick={() => {
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Open Call
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Open Call</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this open call? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedOpenCall && (
            <div className="flex items-center gap-4 py-2">
              <div className="h-16 w-16 relative rounded-md overflow-hidden">
                <Image
                  src={selectedOpenCall.image_url || "/placeholder.svg?height=64&width=64"}
                  alt={selectedOpenCall.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium">{selectedOpenCall.title}</h4>
                <p className="text-sm text-muted-foreground">By {selectedOpenCall.organizations?.name || "Unknown"}</p>
              </div>
            </div>
          )}

          <div className="bg-destructive/10 text-destructive rounded-md p-3 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-medium">Warning</p>
              <p className="text-sm">This will permanently delete the open call and all associated submissions.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteOpenCall} disabled={deletingOpenCall}>
              {deletingOpenCall && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Open Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Open Call</DialogTitle>
            <DialogDescription>Review this open call and decide whether to approve or reject it.</DialogDescription>
          </DialogHeader>

          {selectedOpenCall && (
            <div className="flex items-center gap-4 py-2">
              <div className="h-16 w-16 relative rounded-md overflow-hidden">
                <Image
                  src={selectedOpenCall.image_url || "/placeholder.svg?height=64&width=64"}
                  alt={selectedOpenCall.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium">{selectedOpenCall.title}</h4>
                <p className="text-sm text-muted-foreground">By {selectedOpenCall.organizations?.name || "Unknown"}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-primary/10 rounded-md p-3">
              <h4 className="font-medium mb-1">Approval Guidelines</h4>
              <ul className="text-sm space-y-1 list-disc pl-4">
                <li>Ensure the open call follows community guidelines</li>
                <li>Verify the organization is legitimate</li>
                <li>Check that deadlines and requirements are clear</li>
                <li>Confirm the content is appropriate for all users</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)} className="sm:order-1">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleApproveOpenCall(false)}
              disabled={processingApproval}
              className="sm:order-2"
            >
              {processingApproval ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Reject Open Call
            </Button>
            <Button
              variant="default"
              onClick={() => handleApproveOpenCall(true)}
              disabled={processingApproval}
              className="sm:order-3"
            >
              {processingApproval ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Approve Open Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
