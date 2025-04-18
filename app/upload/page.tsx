import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { UploadArtworkForm } from "@/components/artwork/upload-artwork-form"

export default async function UploadPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Upload Artwork</h1>
        <p className="text-muted-foreground">Share your artwork with the ArtHub community</p>
      </div>

      <UploadArtworkForm userId={session.user.id} />
    </div>
  )
}
