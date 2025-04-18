"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Filter, ChevronRight, Loader2 } from "lucide-react"

interface Artwork {
  id: string
  title: string
  image_url: string
  user_id: string
  price: number
  currency: string
  medium: string
  tags: string[]
  profiles: {
    name: string
  }
  likes_count?: number
  view_count?: number
}

export function DiscoverArtworks() {
  const [artworks, setArtworks] = useState<Record<string, Artwork[]>>({
    trending: [],
    recent: [],
    popular: [],
    curated: [],
  })
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    trending: true,
    recent: true,
    popular: true,
    curated: true,
  })
  const [visibleCount, setVisibleCount] = useState(8)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchArtworks = async () => {
      // Fetch trending artworks (based on view count)
      setIsLoading((prev) => ({ ...prev, trending: true }))
      const { data: trendingData, error: trendingError } = await supabase
        .from("artworks")
        .select(
          `
          id, title, image_url, user_id, price, currency, medium, tags,
          profiles:user_id (name),
          view_count
        `,
        )
        .order("view_count", { ascending: false })
        .limit(20)

      if (!trendingError && trendingData) {
        setArtworks((prev) => ({ ...prev, trending: trendingData }))
      }
      setIsLoading((prev) => ({ ...prev, trending: false }))

      // Fetch recent artworks
      setIsLoading((prev) => ({ ...prev, recent: true }))
      const { data: recentData, error: recentError } = await supabase
        .from("artworks")
        .select(
          `
          id, title, image_url, user_id, price, currency, medium, tags,
          profiles:user_id (name)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(20)

      if (!recentError && recentData) {
        setArtworks((prev) => ({ ...prev, recent: recentData }))
      }
      setIsLoading((prev) => ({ ...prev, recent: false }))

      // Fetch popular artworks (based on likes)
      setIsLoading((prev) => ({ ...prev, popular: true }))
      const { data: likesData, error: likesError } = await supabase
        .from("likes")
        .select("artwork_id, count", { count: "exact" })
        .group("artwork_id")
        .order("count", { ascending: false })
        .limit(20)

      if (!likesError && likesData && likesData.length > 0) {
        const artworkIds = likesData.map((item: any) => item.artwork_id)
        const { data: popularData, error: popularError } = await supabase
          .from("artworks")
          .select(
            `
            id, title, image_url, user_id, price, currency, medium, tags,
            profiles:user_id (name)
          `,
          )
          .in("id", artworkIds)

        if (!popularError && popularData) {
          // Sort by the order of likes
          const sortedPopularData = popularData.sort((a, b) => {
            const aLikes = likesData.find((item: any) => item.artwork_id === a.id)?.count || 0
            const bLikes = likesData.find((item: any) => item.artwork_id === b.id)?.count || 0
            return bLikes - aLikes
          })

          // Add likes count to each artwork
          const popularWithLikes = sortedPopularData.map((artwork) => {
            const likes = likesData.find((item: any) => item.artwork_id === artwork.id)?.count || 0
            return { ...artwork, likes_count: likes }
          })

          setArtworks((prev) => ({ ...prev, popular: popularWithLikes }))
        }
      }
      setIsLoading((prev) => ({ ...prev, popular: false }))

      // Fetch curated artworks (random selection for now, could be admin-selected in the future)
      setIsLoading((prev) => ({ ...prev, curated: true }))
      const { data: curatedData, error: curatedError } = await supabase
        .from("artworks")
        .select(
          `
          id, title, image_url, user_id, price, currency, medium, tags,
          profiles:user_id (name)
        `,
        )
        .limit(20)

      if (!curatedError && curatedData) {
        // Shuffle the array to simulate curation
        const shuffled = [...curatedData].sort(() => 0.5 - Math.random())
        setArtworks((prev) => ({ ...prev, curated: shuffled }))
      }
      setIsLoading((prev) => ({ ...prev, curated: false }))
    }

    fetchArtworks()
  }, [supabase])

  const loadMore = () => {
    setVisibleCount((prev) => prev + 8)
  }

  const formatPrice = (price: number, currency: string) => {
    if (!price) return "Price on request"

    const currencySymbols: Record<string, string> = {
      ZAR: "R",
      USD: "$",
      EUR: "€",
      GBP: "£",
    }

    const symbol = currencySymbols[currency] || currency
    return `${symbol}${price.toLocaleString()}`
  }

  return (
    <section className="py-12">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Discover Artworks</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                View all
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="trending" className="space-y-6">
          <TabsList className="bg-background border">
            <TabsTrigger
              value="trending"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Trending
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Recent
            </TabsTrigger>
            <TabsTrigger
              value="popular"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Popular
            </TabsTrigger>
            <TabsTrigger
              value="curated"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Curated
            </TabsTrigger>
          </TabsList>

          {(["trending", "recent", "popular", "curated"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-6">
              {isLoading[tab] ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : artworks[tab].length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {artworks[tab].slice(0, visibleCount).map((artwork) => (
                      <Link key={artwork.id} href={`/artwork/${artwork.id}`}>
                        <Card className="overflow-hidden transition-all hover:shadow-md">
                          <div className="relative aspect-square">
                            <Image
                              src={artwork.image_url || "/placeholder.svg"}
                              alt={artwork.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium line-clamp-1">{artwork.title}</h3>
                            <p className="text-sm text-muted-foreground">{artwork.profiles.name}</p>
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-sm font-medium">{formatPrice(artwork.price, artwork.currency)}</p>
                              {artwork.medium && (
                                <Badge variant="outline" className="text-xs">
                                  {artwork.medium}
                                </Badge>
                              )}
                            </div>
                            {tab === "trending" && artwork.view_count && (
                              <p className="text-xs text-muted-foreground mt-1">{artwork.view_count} views</p>
                            )}
                            {tab === "popular" && artwork.likes_count && (
                              <p className="text-xs text-muted-foreground mt-1">{artwork.likes_count} likes</p>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {visibleCount < artworks[tab].length && (
                    <div className="flex justify-center mt-8">
                      <Button onClick={loadMore} variant="outline">
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-center py-12 text-muted-foreground">
                  <p>No artworks found</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
