import Link from "next/link"
import Image from "next/image"
import { AspectRatio } from "@/components/ui/aspect-ratio"

interface ArtworkGridProps {
  artworks: any[]
}

export function ArtworkGrid({ artworks }: ArtworkGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {artworks.map((artwork) => (
        <Link
          key={artwork.id}
          href={`/artwork/${artwork.id}`}
          className="group overflow-hidden rounded-lg border bg-background transition-colors hover:bg-accent/50"
        >
          <div className="relative">
            <AspectRatio ratio={1}>
              <Image
                src={artwork.image_url || "/placeholder.svg"}
                alt={artwork.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </AspectRatio>
          </div>
          <div className="p-3">
            <h3 className="font-medium line-clamp-1">{artwork.title}</h3>
            <p className="text-sm text-muted-foreground">{artwork.medium}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
