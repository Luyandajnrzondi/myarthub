"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Search, ExternalLink, ShieldAlert, ShieldCheck } from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  role: string
  is_admin: boolean
  created_at: string
}

export function AdminUsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

        if (error) throw error
        setUsers(data || [])
        setFilteredUsers(data || [])
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [supabase])

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleToggleAdmin = async () => {
    if (!selectedUser) return

    setIsProcessing(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_admin: !selectedUser.is_admin,
        })
        .eq("id", selectedUser.id)

      if (error) throw error

      // Update local state
      const updatedUser = { ...selectedUser, is_admin: !selectedUser.is_admin }
      setSelectedUser(updatedUser)
      setUsers((prev) => prev.map((user) => (user.id === selectedUser.id ? updatedUser : user)))
      setFilteredUsers((prev) => prev.map((user) => (user.id === selectedUser.id ? updatedUser : user)))

      toast({
        title: "User updated",
        description: `Admin privileges ${updatedUser.is_admin ? "granted to" : "revoked from"} ${updatedUser.name}.`,
      })
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    {user.is_admin ? <Badge variant="default">Admin</Badge> : <Badge variant="outline">User</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewUser(user)}>
                        Manage
                      </Button>
                      <Link href={`/profile/${user.id}`} target="_blank">
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
            <p>No users found</p>
          </div>
        )}
      </div>

      {selectedUser && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Manage User</DialogTitle>
              <DialogDescription>View and manage user details and permissions.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Joined</p>
                  <p className="text-sm">{formatDate(selectedUser.created_at)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Admin Status</p>
                <p className="text-sm">
                  {selectedUser.is_admin ? (
                    <Badge variant="default">Admin</Badge>
                  ) : (
                    <Badge variant="outline">Regular User</Badge>
                  )}
                </p>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant={selectedUser.is_admin ? "destructive" : "default"}
                onClick={handleToggleAdmin}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : selectedUser.is_admin ? (
                  <ShieldAlert className="h-4 w-4 mr-2" />
                ) : (
                  <ShieldCheck className="h-4 w-4 mr-2" />
                )}
                {selectedUser.is_admin ? "Remove Admin" : "Make Admin"}
              </Button>
              <Link href={`/profile/${selectedUser.id}`} target="_blank" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
