import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { MessageList } from "@/components/messages/message-list"
import { MessagePanel } from "@/components/messages/message-panel"

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirectTo=/messages")
  }

  // Get conversation ID from query params
  const conversationId = typeof searchParams.conversation === "string" ? searchParams.conversation : undefined

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 h-[calc(100vh-200px)] min-h-[500px]">
        <MessageList userId={session.user.id} selectedConversationId={conversationId} />
        <MessagePanel userId={session.user.id} conversationId={conversationId} />
      </div>
    </div>
  )
}
