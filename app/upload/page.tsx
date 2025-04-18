import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { UploadArtworkForm } from "@/components/artwork/upload-artwork-form"

export default async function UploadPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={profile} />
      <main className="flex-1 container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Upload Artwork</h1>
          <p className="text-muted-foreground">Share your artwork with the ArtHub community</p>
        </div>
        <UploadArtworkForm userId={session.user.id} />
      </main>
    </div>
  )
}
