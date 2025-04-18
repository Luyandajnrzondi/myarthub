import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

interface ArtistCardProps {
  artist: any
}

export function ArtistCard({ artist }: ArtistCardProps) {
  if (!artist) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar>
          <AvatarImage src={artist.avatar_url || "/placeholder.svg"} alt={artist.name} />
          <AvatarFallback>{artist.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-base">
            <Link href={`/profile/${artist.id}`} className="hover:underline">
              {artist.name}
            </Link>
          </CardTitle>
          <CardDescription className="capitalize">{artist.role}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {artist.bio ? (
          <p className="text-sm text-muted-foreground line-clamp-3">{artist.bio}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No bio available</p>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full gap-2">
          <Button variant="outline" className="flex-1">
            Follow
          </Button>
          <Button variant="outline" className="flex-1">
            <MessageSquare className="mr-2 h-4 w-4" />
            Message
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
