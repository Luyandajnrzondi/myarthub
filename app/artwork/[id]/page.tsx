import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArtworkDetails } from "@/components/artwork/artwork-details"
import { ArtworkActions } from "@/components/artwork/artwork-actions"
import { ArtistCard } from "@/components/artwork/artist-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function ArtworkPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // Get artwork data
  const { data: artwork, error: artworkError } = await supabase
    .from("artworks")
    .select("*")
    .eq("id", params.id)
    .single()

  if (artworkError || !artwork) {
    notFound()
  }

  // Get artist profile
  const { data: artist } = await supabase.from("profiles").select("*").eq("id", artwork.user_id).single()

  // Check if this is the current user's artwork
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isOwner = session?.user?.id === artwork.user_id

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4 -ml-3">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>

        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-lg border">
              <Image
                src={artwork.image_url || "/placeholder.svg"}
                alt={artwork.title}
                width={1200}
                height={800}
                className="w-full object-cover"
              />
            </div>

            <ArtworkDetails artwork={artwork} />
          </div>

          <div className="space-y-6">
            <ArtistCard artist={artist} />
            <ArtworkActions artwork={artwork} isOwner={isOwner} />
          </div>
        </div>
      </div>
    </div>
  )
}
