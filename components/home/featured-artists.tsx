import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export async function FeaturedArtists() {
  const supabase = createServerComponentClient({ cookies })

  // Get featured artists (artists with most artworks)
  const { data: artists } = await supabase
    .from("profiles")
    .select("id, name, avatar_url, role, bio")
    .eq("role", "artist")
    .limit(4)

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {artists && artists.length > 0
        ? artists.map((artist) => (
            <Card key={artist.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={artist.avatar_url || "/placeholder.svg"} alt={artist.name} />
                    <AvatarFallback>{artist.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium text-lg">{artist.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{artist.role}</p>
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
        : // Placeholder artists if none are found
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium text-lg">Artist Name</h3>
                  <p className="text-sm text-muted-foreground">Artist</p>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-center">
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
    </div>
  )
}
