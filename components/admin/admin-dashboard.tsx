"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, User, ImageIcon, FileText } from "lucide-react"
import { AdminReportsList } from "@/components/admin/admin-reports-list"
import { AdminUsersList } from "@/components/admin/admin-users-list"
import { AdminArtworksList } from "@/components/admin/admin-artworks-list"
import { AdminOpenCallsList } from "@/components/admin/admin-open-calls-list"

interface AdminDashboardProps {
  userId: string
}

export function AdminDashboard({ userId }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    users: 0,
    artworks: 0,
    openCalls: 0,
    reports: 0,
    pendingReports: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        // Get user count
        const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact" })

        // Get artwork count
        const { count: artworkCount } = await supabase.from("artworks").select("*", { count: "exact" })

        // Get open calls count
        const { count: openCallCount } = await supabase.from("open_calls").select("*", { count: "exact" })

        // Get reports count
        const { count: reportCount } = await supabase.from("reports").select("*", { count: "exact" })

        // Get pending reports count
        const { count: pendingReportCount } = await supabase
          .from("reports")
          .select("*", { count: "exact" })
          .eq("status", "pending")

        setStats({
          users: userCount || 0,
          artworks: artworkCount || 0,
          openCalls: openCallCount || 0,
          reports: reportCount || 0,
          pendingReports: pendingReportCount || 0,
        })
      } catch (error) {
        console.error("Error fetching admin stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{stats.users}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Artworks</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{stats.artworks}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Calls</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{stats.openCalls}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="flex items-center">
                <div className="text-2xl font-bold">{stats.pendingReports}</div>
                {stats.pendingReports > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    Needs attention
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="artworks">Artworks</TabsTrigger>
          <TabsTrigger value="open-calls">Open Calls</TabsTrigger>
        </TabsList>
        <TabsContent value="reports">
          <AdminReportsList />
        </TabsContent>
        <TabsContent value="users">
          <AdminUsersList />
        </TabsContent>
        <TabsContent value="artworks">
          <AdminArtworksList />
        </TabsContent>
        <TabsContent value="open-calls">
          <AdminOpenCallsList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
