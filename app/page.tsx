import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FeaturedArtists } from "@/components/home/featured-artists"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function Home() {
  const supabase = createServerComponentClient({ cookies })

  // Get trending tags
  const { data: tags } = await supabase.from("artworks").select("tags").not("tags", "is", null).limit(50)

  // Extract and count unique tags
  const tagCounts: Record<string, number> = {}
  tags?.forEach((artwork) => {
    if (artwork.tags) {
      artwork.tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    }
  })

  // Sort tags by count and take top 10
  const trendingTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag)

  return (
    <>
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/60 to-background z-10" />
        <div
          className="h-[600px] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/placeholder.svg?height=1200&width=1600')" }}
        />
        <div className="container absolute inset-0 z-20 flex flex-col items-start justify-center">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Connect with the Art World
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            ArtHub bridges the gap between artists, curators, galleries, and collectors. Showcase your work, discover
            new artists, and join a thriving creative community.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Join as an Artist
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="px-8">
                Explore Artworks
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Tags Section */}
      <section className="container py-12 md:py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Trending Tags</h2>
          <Link href="/tags" className="text-sm font-medium text-muted-foreground hover:text-primary">
            View all tags →
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingTags.length > 0
            ? trendingTags.map((tag) => (
                <Link key={tag} href={`/explore?tag=${tag}`}>
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    #{tag}
                  </Badge>
                </Link>
              ))
            : Array.from({ length: 10 }).map((_, i) => (
                <Badge key={i} variant="secondary" className="px-3 py-1 text-sm">
                  #
                  {
                    [
                      "oilpainting",
                      "abstract",
                      "portrait",
                      "landscape",
                      "contemporary",
                      "sculpture",
                      "photography",
                      "digital",
                      "mixedmedia",
                      "watercolor",
                    ][i]
                  }
                </Badge>
              ))}
        </div>
      </section>

      {/* Featured Artists Section */}
      <section className="container py-12 md:py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Featured Artists</h2>
          <Link href="/artists" className="text-sm font-medium text-muted-foreground hover:text-primary">
            View all artists →
          </Link>
        </div>
        <FeaturedArtists />
      </section>
    </>
  )
}
