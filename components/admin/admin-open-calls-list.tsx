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
import { Loader2, Search, Eye, Trash2, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface OpenCall {
  id: string
  title: string
  description: string
  image_url: string
  organization: string
  deadline: string
  status: string
  created_at: string
  created_by: string
  profiles: {
    name: string
    email: string
  }
  submissions_count?: number
}

export function AdminOpenCallsList() {
  const [openCalls, setOpenCalls] = useState<OpenCall[]>([])
  const [filteredOpenCalls, setFilteredOpenCalls] = useState<OpenCall[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [openCallToDelete, setOpenCallToDelete] = useState<OpenCall | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchOpenCalls()
  }, [])

  useEffect(() => {
    let filtered = openCalls

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((call) => call.status === statusFilter)
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (call) =>
          call.title.toLowerCase().includes(query) ||
          call.organization.toLowerCase().includes(query) ||
          call.profiles?.name.toLowerCase().includes(query),
      )
    }

    setFilteredOpenCalls(filtered)
  }, [searchQuery, statusFilter, openCalls])

  const fetchOpenCalls = async () => {
    try {
      setIsLoading(true)

      // Fetch open calls with profile information
      const { data: openCallsData, error: openCallsError } = await supabase
        .from("open_calls")
        .select(`
          id, title, description, image_url, organization, deadline, status, created_at, created_by,
          profiles:created_by (name, email)
        `)
        .order("created_at", { ascending: false })

      if (openCallsError) {
        console.error("Error fetching open calls:", openCallsError)
        return
      }

      // Fetch submissions count for each open call
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("open_call_submissions")
        .select("open_call_id")

      if (submissionsError) {
        console.error("Error fetching submissions:", submissionsError)
      }

      // Count submissions per open call
      const submissionsCount: Record<string, number> = {}
      submissionsData?.forEach((submission) => {
        if (submission.open_call_id) {
          submissionsCount[submission.open_call_id] = (submissionsCount[submission.open_call_id] || 0) + 1
        }
      })

      // Combine all data
      const openCallsWithCounts =
        openCallsData?.map((call) => ({
          ...call,
          submissions_count: submissionsCount[call.id] || 0,
        })) || []

      setOpenCalls(openCallsWithCounts)
      setFilteredOpenCalls(openCallsWithCounts)
    } catch (error) {
      console.error("Error in fetchOpenCalls:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (openCall: OpenCall) => {
    setOpenCallToDelete(openCall)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!openCallToDelete) return

    try {
      setIsDeleting(true)

      // Delete submissions associated with the open call
      await supabase.from("open_call_submissions").delete().eq("open_call_id", openCallToDelete.id)

      // Delete the open call
      const { error } = await supabase.from("open_calls").delete().eq("id", openCallToDelete.id)

      if (error) {
        console.error("Error deleting open call:", error)
        return
      }

      // Remove the open call from the state
      setOpenCalls(openCalls.filter((call) => call.id !== openCallToDelete.id))
      setFilteredOpenCalls(filteredOpenCalls.filter((call) => call.id !== openCallToDelete.id))

      // Log the admin action
      await supabase.from("admin_logs").insert({
        action: "delete_open_call",
        resource_id: openCallToDelete.id,
        details: `Deleted open call: ${openCallToDelete.title}`,
      })
    } catch (error) {
      console.error("Error in handleDeleteConfirm:", error)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setOpenCallToDelete(null)
    }
  }

  const handleStatusChange = async (openCallId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("open_calls").update({ status: newStatus }).eq("id", openCallId)

      if (error) {
        console.error("Error updating open call status:", error)
        return
      }

      // Update the state
      const updatedOpenCalls = openCalls.map((call) => (call.id === openCallId ? { ...call, status: newStatus } : call))
      setOpenCalls(updatedOpenCalls)

      // Apply filters to the updated list
      let filtered = updatedOpenCalls
      if (statusFilter !== "all") {
        filtered = filtered.filter((call) => call.status === statusFilter)
      }
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (call) =>
            call.title.toLowerCase().includes(query) ||
            call.organization.toLowerCase().includes(query) ||
            call.profiles?.name.toLowerCase().includes(query),
        )
      }
      setFilteredOpenCalls(filtered)

      // Log the admin action
      await supabase.from("admin_logs").insert({
        action: `update_open_call_status_to_${newStatus}`,
        resource_id: openCallId,
        details: `Updated open call status to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error in handleStatusChange:", error)
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
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Manage Open Calls</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <select
              className="rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search open calls..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredOpenCalls.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Open Call</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOpenCalls.map((openCall) => (
                <TableRow key={openCall.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded">
                        <Image
                          src={openCall.image_url || "/placeholder.svg?height=40&width=40"}
                          alt={openCall.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="font-medium">{openCall.title}</div>
                    </div>
                  </TableCell>
                  <TableCell>{openCall.organization}</TableCell>
                  <TableCell>{openCall.profiles?.name || "Unknown"}</TableCell>
                  <TableCell>{formatDate(openCall.deadline)}</TableCell>
                  <TableCell>{getStatusBadge(openCall.status)}</TableCell>
                  <TableCell>{openCall.submissions_count || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {openCall.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStatusChange(openCall.id, "approved")}
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="sr-only">Approve</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStatusChange(openCall.id, "rejected")}
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="sr-only">Reject</span>
                          </Button>
                        </>
                      )}
                      <Link href={`/open-calls/${openCall.id}`} target="_blank">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(openCall)}>
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
          <p>No open calls found</p>
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
              Are you sure you want to delete the open call "{openCallToDelete?.title}"? This action cannot be undone.
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
                "Delete Open Call"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
