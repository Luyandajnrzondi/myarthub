import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
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

  // Get user's artworks
  const { data: artworks } = await supabase
    .from("artworks")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={profile} />
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link href="/upload">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload Artwork
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>My Artworks</CardTitle>
              <CardDescription>You have {artworks?.length || 0} artworks</CardDescription>
            </CardHeader>
            <CardContent>
              {artworks && artworks.length > 0 ? (
                <div className="space-y-2">
                  {artworks.slice(0, 3).map((artwork) => (
                    <div key={artwork.id} className="flex items-center gap-2">
                      <div
                        className="h-10 w-10 rounded bg-cover bg-center"
                        style={{ backgroundImage: `url(${artwork.image_url || "/placeholder.svg"})` }}
                      />
                      <div>
                        <p className="font-medium">{artwork.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {artwork.price ? `${artwork.currency} ${artwork.price}` : "Not for sale"}
                        </p>
                      </div>
                    </div>
                  ))}
                  {artworks.length > 3 && (
                    <Link href="/profile/artworks" className="text-sm text-primary hover:underline">
                      View all artworks
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">You haven't uploaded any artworks yet</p>
                  <Link href="/upload">
                    <Button variant="outline" size="sm">
                      Upload Your First Artwork
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{profile?.name || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Bio</p>
                  <p className="text-sm text-muted-foreground">{profile?.bio || "No bio added yet"}</p>
                </div>
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm" className="w-full">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
