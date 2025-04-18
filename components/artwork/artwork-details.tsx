import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface ArtworkDetailsProps {
  artwork: any
}

export function ArtworkDetails({ artwork }: ArtworkDetailsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{artwork.title}</h1>
        {artwork.year && <p className="text-muted-foreground">{artwork.year}</p>}
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

        {artwork.dimensions && (
          <div>
            <h3 className="text-sm font-medium">Dimensions</h3>
            <p className="text-sm text-muted-foreground">{artwork.dimensions}</p>
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
            <p className="text-sm text-muted-foreground">${artwork.price.toLocaleString()}</p>
          </div>
        )}
      </div>

      {artwork.tags && artwork.tags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {artwork.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
