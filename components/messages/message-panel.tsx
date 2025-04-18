"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

interface MessagePanelProps {
  userId: string
  conversationId?: string
}

interface Message {
  id: string
  content: string
  created_at: string
  user_id: string
}

interface Participant {
  id: string
  name: string
  avatar_url: string | null
}

export function MessagePanel({ userId, conversationId }: MessagePanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [otherUser, setOtherUser] = useState<Participant | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!conversationId) return

    const fetchMessages = async () => {
      setIsLoading(true)

      try {
        // Get messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true })

        if (messagesError) throw messagesError

        setMessages(messagesData || [])

        // Get other participant
        const { data: otherParticipant, error: participantError } = await supabase
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
          .eq("conversation_id", conversationId)
          .neq("user_id", userId)
          .single()

        if (participantError) throw participantError

        setOtherUser({
          id: otherParticipant.user_id,
          name: otherParticipant.profiles.name,
          avatar_url: otherParticipant.profiles.avatar_url,
        })

        // Mark messages as read
        await supabase
          .from("messages")
          .update({ read: true })
          .eq("conversation_id", conversationId)
          .neq("user_id", userId)
          .eq("read", false)
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()

    // Set up real-time subscription
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages((prev) => [...prev, newMessage])

          // Mark message as read if it's not from the current user
          if (newMessage.user_id !== userId) {
            supabase
              .from("messages")
              .update({ read: true })
              .eq("id", newMessage.id)
              .then(({ error }) => {
                if (error) console.error("Error marking message as read:", error)
              })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [conversationId, userId, supabase])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!conversationId || !newMessage.trim()) return

    setIsSending(true)

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        user_id: userId,
        content: newMessage.trim(),
      })

      if (error) throw error

      setNewMessage("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
  }

  // Group messages by date
  const groupedMessages: { [date: string]: Message[] } = {}
  messages.forEach((message) => {
    const date = new Date(message.created_at).toLocaleDateString()
    if (!groupedMessages[date]) {
      groupedMessages[date] = []
    }
    groupedMessages[date].push(message)
  })

  if (!conversationId) {
    return (
      <div className="flex flex-col items-center justify-center h-full border rounded-lg p-6 text-center">
        <p className="text-muted-foreground mb-4">Select a conversation or start a new one</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      {otherUser && (
        <div className="p-3 border-b flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={otherUser.avatar_url || "/placeholder.svg"} alt={otherUser.name} />
            <AvatarFallback>{otherUser.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <Link href={`/profile/${otherUser.id}`} className="font-medium hover:underline">
            {otherUser.name}
          </Link>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="space-y-3">
                <div className="flex justify-center">
                  <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                    {formatDate(dateMessages[0].created_at)}
                  </span>
                </div>
                {dateMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.user_id === userId ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.user_id === userId
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-accent-foreground"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs opacity-70 text-right mt-1">{formatTime(message.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>

      <div className="p-3 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Textarea
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[60px] flex-1 resize-none"
          />
          <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
