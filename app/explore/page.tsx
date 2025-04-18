import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { ArtworkGrid } from "@/components/artwork/artwork-grid"
import { ExploreFilters } from "@/components/explore/explore-filters"

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createServerComponentClient({ cookies })

  // Parse search params
  const tag = typeof searchParams.tag === "string" ? searchParams.tag : undefined
  const medium = typeof searchParams.medium === "string" ? searchParams.medium : undefined
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "newest"

  // Build query
  let query = supabase.from("artworks").select("*")

  // Apply filters
  if (tag) {
    query = query.contains("tags", [tag])
  }

  if (medium) {
    query = query.eq("medium", medium)
  }

  if (status) {
    query = query.eq("status", status)
  }

  // Apply sorting
  if (sort === "newest") {
    query = query.order("created_at", { ascending: false })
  } else if (sort === "oldest") {
    query = query.order("created_at", { ascending: true })
  } else if (sort === "price_high") {
    query = query.order("price", { ascending: false })
  } else if (sort === "price_low") {
    query = query.order("price", { ascending: true })
  }

  // Get artworks
  const { data: artworks } = await query.limit(20)

  // Get available mediums for filter
  const { data: mediums } = await supabase.from("artworks").select("medium").not("medium", "is", null).limit(100)

  const uniqueMediums = Array.from(new Set(mediums?.map((item) => item.medium).filter(Boolean)))

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="w-full md:w-64 lg:w-72">
          <ExploreFilters
            mediums={uniqueMediums}
            selectedTag={tag}
            selectedMedium={medium}
            selectedStatus={status}
            selectedSort={sort}
          />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6">{tag ? `Exploring #${tag}` : "Explore Artworks"}</h1>

          {artworks && artworks.length > 0 ? (
            <ArtworkGrid artworks={artworks} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No artworks found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
