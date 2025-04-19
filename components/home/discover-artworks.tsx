"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArtworkGrid } from "@/components/artwork/artwork-grid"
import { Loader2 } from "lucide-react"
import { useRealtimeData } from "@/hooks/use-realtime-data"

interface Artwork {
  id: string
  title: string
  image_url: string
  user_id: string
  artist_name?: string
  medium?: string
  price?: number
  currency?: string
  created_at: string
}

export function DiscoverArtworks() {
  const [activeTab, setActiveTab] = useState("trending")
  const [isLoading, setIsLoading] = useState(true)
  const [trendingArtworks, setTrendingArtworks] = useState<Artwork[]>([])
  const [recentArtworks, setRecentArtworks] = useState<Artwork[]>([])
  const [popularArtworks, setPopularArtworks] = useState<Artwork[]>([])
  const [curatedArtworks, setCuratedArtworks] = useState<Artwork[]>([])
  const [profilesMap, setProfilesMap] = useState<Record<string, string>>({})
  const [visibleCount, setVisibleCount] = useState(8)
  const supabase = createClientComponentClient()

  // Use our real-time hook to listen for new artworks
  const { data: newArtworks } = useRealtimeData<Artwork>({
    table: "artworks",
    event: "INSERT",
    initialData: [],
    onInsert: (artwork) => {
      // Add the new artwork to the recent list
      setRecentArtworks((prev) => [addArtistName(artwork), ...prev])
    },
  })

  useEffect(() => {
    fetchProfiles()
    fetchArtworks()
  }, [])

  const fetchProfiles = async () => {
    try {
      const { data: profiles, error } = await supabase.from("profiles").select("id, name")

      if (error) {
        console.error("Error fetching profiles:", error)
        return
      }

      // Create a map of profile IDs to names
      const profileMap: Record<string, string> = {}
      profiles?.forEach((profile) => {
        profileMap[profile.id] = profile.name
      })

      setProfilesMap(profileMap)
    } catch (error) {
      console.error("Error in fetchProfiles:", error)
    }
  }

  const addArtistName = (artwork: Artwork): Artwork => {
    return {
      ...artwork,
      artist_name: profilesMap[artwork.user_id] || "Unknown Artist",
    }
  }

  const fetchArtworks = async () => {
    setIsLoading(true)
    try {
      // Fetch trending artworks (most viewed)
      const { data: trendingData, error: trendingError } = await supabase
        .from("artworks")
        .select("*")
        .order("view_count", { ascending: false })
        .limit(20)

      if (trendingError) {
        console.error("Error fetching trending artworks:", trendingError)
      } else {
        setTrendingArtworks(trendingData?.map(addArtistName) || [])
      }

      // Fetch recent artworks
      const { data: recentData, error: recentError } = await supabase
        .from("artworks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)

      if (recentError) {
        console.error("Error fetching recent artworks:", recentError)
      } else {
        setRecentArtworks(recentData?.map(addArtistName) || [])
      }

      // Fetch likes for popularity calculation
      const { data: likesData, error: likesError } = await supabase.from("likes").select("artwork_id")

      if (likesError) {
        console.error("Error fetching likes:", likesError)
      } else {
        // Count likes per artwork
        const likesCount: Record<string, number> = {}
        likesData?.forEach((like) => {
          likesCount[like.artwork_id] = (likesCount[like.artwork_id] || 0) + 1
        })

        // Fetch all artworks for popularity sorting
        const { data: allArtworks, error: artworksError } = await supabase.from("artworks").select("*")

        if (artworksError) {
          console.error("Error fetching artworks for popularity:", artworksError)
        } else {
          // Sort by likes count
          const sortedByPopularity = [...(allArtworks || [])]
            .map((artwork) => ({
              ...artwork,
              likes_count: likesCount[artwork.id] || 0,
            }))
            .sort((a, b) => b.likes_count - a.likes_count)
            .slice(0, 20)

          setPopularArtworks(sortedByPopularity.map(addArtistName))
        }
      }

      // For curated, we'll use a mix of trending and high-quality artworks
      // In a real app, this might be editorially selected or algorithmically determined
      const { data: curatedData, error: curatedError } = await supabase
        .from("artworks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)

      if (curatedError) {
        console.error("Error fetching curated artworks:", curatedError)
      } else {
        // For demo purposes, we'll just use a different sort of the recent artworks
        setCuratedArtworks(
          curatedData
            ?.sort((a, b) => {
              // Sort by a combination of factors
              const aScore = (a.view_count || 0) + (a.price || 0) / 100
              const bScore = (b.view_count || 0) + (b.price || 0) / 100
              return bScore - aScore
            })
            .map(addArtistName) || [],
        )
      }
    } catch (error) {
      console.error("Error in fetchArtworks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8)
  }

  const getActiveArtworks = () => {
    switch (activeTab) {
      case "trending":
        return trendingArtworks
      case "recent":
        return recentArtworks
      case "popular":
        return popularArtworks
      case "curated":
        return curatedArtworks
      default:
        return []
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="trending" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="curated">Curated</TabsTrigger>
        </TabsList>

        {["trending", "recent", "popular", "curated"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : getActiveArtworks().length > 0 ? (
              <>
                <ArtworkGrid artworks={getActiveArtworks().slice(0, visibleCount)} />
                {visibleCount < getActiveArtworks().length && (
                  <div className="flex justify-center">
                    <Button onClick={handleLoadMore} variant="outline">
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
  )
}
