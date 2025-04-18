import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createServerComponentClient({ cookies })

  // Parse search params
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined

  // Build query
  let query = supabase.from("profiles").select("*").eq("role", "artist")

  // Apply search filter
  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  // Get artists
  const { data: artists } = await query.order("name").limit(20)

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Artists</h1>

        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <form>
            <Input
              type="search"
              name="search"
              placeholder="Search artists..."
              defaultValue={search}
              className="pl-8 w-full md:w-[300px]"
            />
          </form>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {artists && artists.length > 0 ? (
          artists.map((artist) => (
            <Card key={artist.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={artist.avatar_url || "/placeholder.svg"} alt={artist.name} />
                    <AvatarFallback>{artist.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium text-lg">{artist.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{artist.role}</p>
                  {artist.location && <p className="text-sm text-muted-foreground mt-1">{artist.location}</p>}
                  {artist.bio && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{artist.bio}</p>}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-center">
                <Link href={`/profile/${artist.id}`}>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground">No artists found</p>
          </div>
        )}
      </div>
    </div>
  )
}
