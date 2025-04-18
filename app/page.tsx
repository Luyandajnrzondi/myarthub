import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DiscoverArtworks } from "@/components/home/discover-artworks"
import { CurrentOpenCalls } from "@/components/home/current-open-calls"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function Home() {
  const supabase = createServerComponentClient({ cookies })

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

      <DiscoverArtworks />

      <CurrentOpenCalls />
    </>
  )
}
