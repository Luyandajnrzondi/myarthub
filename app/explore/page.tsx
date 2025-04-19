import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import Image from "next/image"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"

export default async function ExplorePage() {
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

  // Get artworks
  const { data: artworks } = await supabase
    .from("artworks")
    .select("*, profiles(name)")
    .order("created_at", { ascending: false })

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={profile} />
      <main className="flex-1 container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Explore Artworks</h1>
          <p className="text-muted-foreground">Discover amazing artworks from artists around the world</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {artworks?.map((artwork) => (
            <Link key={artwork.id} href={`/artwork/${artwork.id}`}>
              <Card className="overflow-hidden transition-all hover:shadow-md">
                <div className="aspect-square relative">
                  <Image
                    src={artwork.image_url || "/placeholder.svg"}
                    alt={artwork.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium line-clamp-1">{artwork.title}</h3>
                  <p className="text-sm text-muted-foreground">{artwork.profiles?.name}</p>
                  {artwork.price && (
                    <p className="text-sm font-medium mt-1">
                      {artwork.currency} {artwork.price}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}

          {(!artworks || artworks.length === 0) && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No artworks found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
