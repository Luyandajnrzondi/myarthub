"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface ExploreFiltersProps {
  mediums: string[]
  selectedTag?: string
  selectedMedium?: string
  selectedStatus?: string
  selectedSort?: string
}

export function ExploreFilters({
  mediums,
  selectedTag,
  selectedMedium,
  selectedStatus,
  selectedSort = "newest",
}: ExploreFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])

  // Update URL with filters
  const updateFilters = (params: Record<string, string | null>) => {
    const url = new URL(window.location.href)

    // Update or remove each parameter
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        url.searchParams.delete(key)
      } else {
        url.searchParams.set(key, value)
      }
    })

    router.push(`${pathname}?${url.searchParams.toString()}`)
  }

  // Clear all filters
  const clearFilters = () => {
    router.push(pathname)
  }

  // Check if any filters are active
  const hasActiveFilters = selectedTag || selectedMedium || selectedStatus || selectedSort !== "newest"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
            Clear all
          </Button>
        )}
      </div>

      {selectedTag && (
        <div>
          <Label className="text-sm">Tags</Label>
          <div className="mt-2">
            <Badge variant="outline" className="flex items-center gap-1">
              #{selectedTag}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => updateFilters({ tag: null })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        </div>
      )}

      <div>
        <Label className="text-sm">Medium</Label>
        <div className="mt-2 space-y-2">
          <RadioGroup value={selectedMedium || ""} onValueChange={(value) => updateFilters({ medium: value || null })}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="medium-all" />
              <Label htmlFor="medium-all" className="cursor-pointer">
                All mediums
              </Label>
            </div>

            {mediums.map((medium) => (
              <div key={medium} className="flex items-center space-x-2">
                <RadioGroupItem value={medium} id={`medium-${medium}`} />
                <Label htmlFor={`medium-${medium}`} className="cursor-pointer">
                  {medium}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div>
        <Label className="text-sm">Status</Label>
        <div className="mt-2 space-y-2">
          <RadioGroup value={selectedStatus || ""} onValueChange={(value) => updateFilters({ status: value || null })}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="status-all" />
              <Label htmlFor="status-all" className="cursor-pointer">
                All statuses
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="available" id="status-available" />
              <Label htmlFor="status-available" className="cursor-pointer">
                Available
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sold" id="status-sold" />
              <Label htmlFor="status-sold" className="cursor-pointer">
                Sold
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not_for_sale" id="status-not-for-sale" />
              <Label htmlFor="status-not-for-sale" className="cursor-pointer">
                Not for sale
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="exhibition" id="status-exhibition" />
              <Label htmlFor="status-exhibition" className="cursor-pointer">
                Exhibition only
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-sm">Sort by</Label>
        <div className="mt-2 space-y-2">
          <RadioGroup value={selectedSort} onValueChange={(value) => updateFilters({ sort: value })}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="newest" id="sort-newest" />
              <Label htmlFor="sort-newest" className="cursor-pointer">
                Newest
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="oldest" id="sort-oldest" />
              <Label htmlFor="sort-oldest" className="cursor-pointer">
                Oldest
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="price_high" id="sort-price-high" />
              <Label htmlFor="sort-price-high" className="cursor-pointer">
                Price: High to Low
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="price_low" id="sort-price-low" />
              <Label htmlFor="sort-price-low" className="cursor-pointer">
                Price: Low to High
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}
