import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Image from "next/image"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function ArtworkPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get user profile if logged in
  let profile = null
  if (session) {
    const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
    profile = data
  }

  // Get artwork details
  const { data: artwork, error } = await supabase.from("artworks").select("*, profiles(*)").eq("id", params.id).single()

  if (error || !artwork) {
    notFound()
  }

  // Format price with currency symbol
  const formatPrice = (price: number, currency: string) => {
    if (!price) return null

    const currencySymbols: Record<string, string> = {
      ZAR: "R",
      USD: "$",
      EUR: "€",
      GBP: "£",
    }

    const symbol = currencySymbols[currency] || currency
    return `${symbol}${price.toLocaleString()}`
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={profile} />
      <main className="flex-1 container py-6">
        <div className="mb-6">
          <Link href="/explore">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Explore
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative aspect-square">
            <Image
              src={artwork.image_url || "/placeholder.svg"}
              alt={artwork.title}
              fill
              className="object-contain rounded-md"
            />
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">{artwork.title}</h1>
                  <Link
                    href={`/profile/${artwork.user_id}`}
                    className="text-muted-foreground hover:text-primary hover:underline"
                  >
                    {artwork.profiles?.name}
                  </Link>
                </div>

                {artwork.description && <p className="text-muted-foreground">{artwork.description}</p>}

                <Separator />

                <div className="grid gap-2 sm:grid-cols-2">
                  {artwork.medium && (
                    <div>
                      <h3 className="text-sm font-medium">Medium</h3>
                      <p className="text-sm text-muted-foreground">{artwork.medium}</p>
                    </div>
                  )}

                  {artwork.status && (
                    <div>
                      <h3 className="text-sm font-medium">Status</h3>
                      <p className="text-sm text-muted-foreground capitalize">{artwork.status.replace("_", " ")}</p>
                    </div>
                  )}

                  {artwork.price && (
                    <div>
                      <h3 className="text-sm font-medium">Price</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(artwork.price, artwork.currency || "ZAR")}
                      </p>
                    </div>
                  )}
                </div>

                {session && artwork.user_id !== session.user.id && (
                  <Button className="w-full mt-4">Contact Artist</Button>
                )}

                {session && artwork.user_id === session.user.id && (
                  <Button variant="outline" className="w-full mt-4">
                    Edit Artwork
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
