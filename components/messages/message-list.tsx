"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { NewMessageDialog } from "@/components/messages/new-message-dialog"

interface MessageListProps {
  userId: string
  selectedConversationId?: string
}

interface Conversation {
  id: string
  last_message: string
  last_message_time: string
  unread_count: number
  other_user: {
    id: string
    name: string
    avatar_url: string | null
  }
}

export function MessageList({ userId, selectedConversationId }: MessageListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true)

      try {
        // Get all conversations where the user is a participant
        const { data: participations, error: participationsError } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", userId)

        if (participationsError) throw participationsError

        if (!participations || participations.length === 0) {
          setConversations([])
          setIsLoading(false)
          return
        }

        const conversationIds = participations.map((p) => p.conversation_id)

        // For each conversation, get the other participant
        const conversationsData: Conversation[] = []

        for (const convId of conversationIds) {
          // Get other participant
          const { data: otherParticipant, error: otherParticipantError } = await supabase
            .from("conversation_participants")
            .select(
              `
              user_id,
              profiles:user_id (
                id,
                name,
                avatar_url
              )
            `,
            )
            .eq("conversation_id", convId)
            .neq("user_id", userId)
            .single()

          if (otherParticipantError) continue

          // Get last message
          const { data: lastMessage, error: lastMessageError } = await supabase
            .from("messages")
            .select("content, created_at")
            .eq("conversation_id", convId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          if (lastMessageError) continue

          // Get unread count
          const { count: unreadCount, error: unreadCountError } = await supabase
            .from("messages")
            .select("id", { count: "exact" })
            .eq("conversation_id", convId)
            .eq("read", false)
            .neq("user_id", userId)

          if (unreadCountError) continue

          conversationsData.push({
            id: convId,
            last_message: lastMessage.content,
            last_message_time: lastMessage.created_at,
            unread_count: unreadCount || 0,
            other_user: {
              id: otherParticipant.user_id,
              name: otherParticipant.profiles.name,
              avatar_url: otherParticipant.profiles.avatar_url,
            },
          })
        }

        // Sort by last message time
        conversationsData.sort(
          (a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime(),
        )

        setConversations(conversationsData)
      } catch (error) {
        console.error("Error fetching conversations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()

    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel("messages_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          // Refresh conversations when a new message is received
          fetchConversations()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [userId, supabase])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const filteredConversations = conversations.filter((conversation) =>
    conversation.other_user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Conversations</h2>
          <Button size="icon" variant="ghost" onClick={() => setIsNewMessageOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search conversations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="divide-y">
            {filteredConversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`${pathname}?conversation=${conversation.id}`}
                className={cn(
                  "flex items-center gap-3 p-3 hover:bg-accent transition-colors",
                  selectedConversationId === conversation.id && "bg-accent",
                )}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={conversation.other_user.avatar_url || "/placeholder.svg"}
                    alt={conversation.other_user.name}
                  />
                  <AvatarFallback>{conversation.other_user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate">{conversation.other_user.name}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(conversation.last_message_time)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground truncate">{conversation.last_message}</p>
                    {conversation.unread_count > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-muted-foreground mb-4">No conversations yet</p>
            <Button size="sm" onClick={() => setIsNewMessageOpen(true)}>
              Start a conversation
            </Button>
          </div>
        )}
      </div>

      <NewMessageDialog
        userId={userId}
        isOpen={isNewMessageOpen}
        onClose={() => setIsNewMessageOpen(false)}
        onConversationCreated={(conversationId) => {
          router.push(`${pathname}?conversation=${conversationId}`)
          setIsNewMessageOpen(false)
        }}
      />
    </div>
  )
}
