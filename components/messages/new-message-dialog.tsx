"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Search } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface NewMessageDialogProps {
  userId: string
  isOpen: boolean
  onClose: () => void
  onConversationCreated: (conversationId: string) => void
}

interface User {
  id: string
  name: string
  avatar_url: string | null
  role: string
}

export function NewMessageDialog({ userId, isOpen, onClose, onConversationCreated }: NewMessageDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const supabase = createClientComponentClient()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, role")
        .neq("id", userId)
        .ilike("name", `%${searchQuery}%`)
        .limit(10)

      if (error) throw error

      setSearchResults(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to search users",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const startConversation = async (otherUserId: string) => {
    setIsCreating(true)
    try {
      // Check if conversation already exists
      const { data: existingConversations, error: checkError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId)

      if (checkError) throw checkError

      const existingConversationIds = existingConversations.map((p) => p.conversation_id)

      if (existingConversationIds.length > 0) {
        const { data: otherParticipants, error: otherError } = await supabase
          .from("conversation_participants")
          .select("conversation_id, user_id")
          .in("conversation_id", existingConversationIds)
          .eq("user_id", otherUserId)

        if (otherError) throw otherError

        if (otherParticipants && otherParticipants.length > 0) {
          // Conversation already exists
          onConversationCreated(otherParticipants[0].conversation_id)
          return
        }
      }

      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from("conversations")
        .insert({})
        .select("id")
        .single()

      if (createError) throw createError

      // Add participants
      const conversationId = newConversation.id
      const participants = [
        { conversation_id: conversationId, user_id: userId },
        { conversation_id: conversationId, user_id: otherUserId },
      ]

      const { error: participantsError } = await supabase.from("conversation_participants").insert(participants)

      if (participantsError) throw participantsError

      onConversationCreated(conversationId)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start conversation",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>Search for a user to start a conversation with.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" className="sr-only">
            Search
          </Button>
        </form>

        <div className="mt-4 max-h-[300px] overflow-y-auto">
          {isSearching ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <Button
                  key={user.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => startConversation(user.id)}
                  disabled={isCreating}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="flex justify-center py-8 text-muted-foreground">
              <p>No users found</p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
