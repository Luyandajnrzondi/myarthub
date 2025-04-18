import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user profile data
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Get user's artworks
  const { data: artworks } = await supabase
    .from("artworks")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  const userRole = profile?.role || session.user.user_metadata.role

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text={`Welcome back, ${profile?.name || session.user.user_metadata.name || "Artist"}`}
      >
        <Link href={`/profile/${session.user.id}`}>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            View Profile
          </Button>
        </Link>
      </DashboardHeader>

      <div className="grid gap-8">
        <EmptyState
          title={`Your ${userRole === "artist" ? "Artwork" : userRole === "curator" ? "Curations" : "Gallery"}`}
          description={`You have ${artworks?.length || 0} ${userRole === "artist" ? "artwork" : userRole === "curator" ? "curations" : "exhibitions"}.`}
          buttonText={`Add ${userRole === "artist" ? "Artwork" : userRole === "curator" ? "Curation" : "Exhibition"}`}
          buttonLink={`/upload`}
        />
      </div>
    </DashboardShell>
  )
}
