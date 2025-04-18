import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageSquare, Share2 } from "lucide-react"

export default async function TimelinePage() {
  const supabase = createServerComponentClient({ cookies })

  // Get latest artworks with artist info
  const { data: artworks } = await supabase
    .from("artworks")
    .select(`
      *,
      profiles:user_id (
        id,
        name,
        avatar_url,
        role
      )
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Timeline</h1>

      <div className="max-w-3xl mx-auto space-y-6">
        {artworks && artworks.length > 0 ? (
          artworks.map((artwork) => (
            <Card key={artwork.id} className="overflow-hidden">
              <CardHeader className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={artwork.profiles.avatar_url || "/placeholder.svg"} alt={artwork.profiles.name} />
                    <AvatarFallback>{artwork.profiles.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/profile/${artwork.profiles.id}`} className="font-medium hover:underline">
                      {artwork.profiles.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{new Date(artwork.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardHeader>
              <Link href={`/artwork/${artwork.id}`}>
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={artwork.image_url || "/placeholder.svg"}
                    alt={artwork.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <Link href={`/artwork/${artwork.id}`} className="hover:underline">
                      <h3 className="font-medium">{artwork.title}</h3>
                    </Link>
                    {artwork.price && (
                      <Badge variant="outline">
                        {artwork.currency === "ZAR"
                          ? "R"
                          : artwork.currency === "USD"
                            ? "$"
                            : artwork.currency === "EUR"
                              ? "€"
                              : artwork.currency === "GBP"
                                ? "£"
                                : ""}
                        {artwork.price.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                  {artwork.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{artwork.description}</p>
                  )}
                  {artwork.tags && artwork.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {artwork.tags.slice(0, 3).map((tag: string) => (
                        <Link key={tag} href={`/explore?tag=${tag}`}>
                          <Badge variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        </Link>
                      ))}
                      {artwork.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{artwork.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <div className="flex gap-4">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 h-8 px-2">
                    <Heart className="h-4 w-4" />
                    <span>Like</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 h-8 px-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Comment</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 h-8 px-2">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </Button>
                </div>
                <Link href={`/artwork/${artwork.id}`}>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg">
            <p className="text-muted-foreground">No artworks found</p>
          </div>
        )}
      </div>
    </div>
  )
}
