"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Report {
  id: string
  reporter_id: string
  reported_type: string
  reported_id: string
  reason: string
  status: string
  admin_notes: string | null
  created_at: string
  profiles: {
    name: string
  }
}

export function AdminReportsList() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("reports")
          .select(
            `
            *,
            profiles:reporter_id (name)
          `,
          )
          .order("created_at", { ascending: false })

        if (error) throw error
        setReports(data || [])
      } catch (error) {
        console.error("Error fetching reports:", error)
        toast({
          title: "Error",
          description: "Failed to load reports",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [supabase])

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
    setAdminNotes(report.admin_notes || "")
    setIsDialogOpen(true)
  }

  const handleResolveReport = async (status: "resolved" | "dismissed") => {
    if (!selectedReport) return

    setIsProcessing(true)
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status,
          admin_notes: adminNotes,
        })
        .eq("id", selectedReport.id)

      if (error) throw error

      // Update local state
      setReports((prev) =>
        prev.map((report) =>
          report.id === selectedReport.id ? { ...report, status, admin_notes: adminNotes } : report,
        ),
      )

      toast({
        title: `Report ${status}`,
        description: `The report has been marked as ${status}.`,
      })

      setIsDialogOpen(false)
    } catch (error) {
      console.error(`Error ${status} report:`, error)
      toast({
        title: "Error",
        description: `Failed to mark report as ${status}`,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getReportedItemLink = (type: string, id: string) => {
    switch (type) {
      case "artwork":
        return `/artwork/${id}`
      case "profile":
        return `/profile/${id}`
      case "comment":
        return `/comment/${id}` // You might need to adjust this
      case "open_call":
        return `/open-calls/${id}`
      default:
        return "#"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "resolved":
        return <Badge variant="success">Resolved</Badge>
      case "dismissed":
        return <Badge variant="secondary">Dismissed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : reports.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium capitalize">{report.reported_type}</TableCell>
                  <TableCell>{report.profiles.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{report.reason}</TableCell>
                  <TableCell>{formatDate(report.created_at)}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewReport(report)}>
                        View
                      </Button>
                      <Link href={getReportedItemLink(report.reported_type, report.reported_id)} target="_blank">
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex justify-center items-center p-8 text-muted-foreground">
            <p>No reports found</p>
          </div>
        )}
      </div>

      {selectedReport && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
              <DialogDescription>Review the report and take appropriate action.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-sm capitalize">{selectedReport.reported_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm">{getStatusBadge(selectedReport.status)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Reported By</p>
                <p className="text-sm">{selectedReport.profiles.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm">{formatDate(selectedReport.created_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Reason</p>
                <p className="text-sm">{selectedReport.reason}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Admin Notes</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about how this report was handled"
                  disabled={selectedReport.status !== "pending"}
                />
              </div>
            </div>
            <DialogFooter>
              {selectedReport.status === "pending" ? (
                <>
                  <Button variant="outline" onClick={() => handleResolveReport("dismissed")} disabled={isProcessing}>
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Dismiss
                  </Button>
                  <Button onClick={() => handleResolveReport("resolved")} disabled={isProcessing}>
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Resolve
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
