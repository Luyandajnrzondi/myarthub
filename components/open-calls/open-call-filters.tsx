"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"

interface OpenCallFiltersProps {
  locations: string[]
  selectedStatus?: string
  selectedLocation?: string
  selectedSort?: string
}

export function OpenCallFilters({
  locations,
  selectedStatus = "open",
  selectedLocation,
  selectedSort = "deadline",
}: OpenCallFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

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
  const hasActiveFilters = selectedStatus !== "open" || selectedLocation || selectedSort !== "deadline"

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

      <div>
        <Label className="text-sm">Status</Label>
        <div className="mt-2 space-y-2">
          <RadioGroup value={selectedStatus} onValueChange={(value) => updateFilters({ status: value })}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="open" id="status-open" />
              <Label htmlFor="status-open" className="cursor-pointer">
                Open
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="closed" id="status-closed" />
              <Label htmlFor="status-closed" className="cursor-pointer">
                Closed
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="status-all" />
              <Label htmlFor="status-all" className="cursor-pointer">
                All
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {locations.length > 0 && (
        <div>
          <Label className="text-sm">Location</Label>
          <div className="mt-2 space-y-2">
            <RadioGroup
              value={selectedLocation || ""}
              onValueChange={(value) => updateFilters({ location: value || null })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="location-all" />
                <Label htmlFor="location-all" className="cursor-pointer">
                  All locations
                </Label>
              </div>

              {locations.map((location) => (
                <div key={location} className="flex items-center space-x-2">
                  <RadioGroupItem value={location} id={`location-${location}`} />
                  <Label htmlFor={`location-${location}`} className="cursor-pointer">
                    {location}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      )}

      <Separator />

      <div>
        <Label className="text-sm">Sort by</Label>
        <div className="mt-2 space-y-2">
          <RadioGroup value={selectedSort} onValueChange={(value) => updateFilters({ sort: value })}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="deadline" id="sort-deadline" />
              <Label htmlFor="sort-deadline" className="cursor-pointer">
                Deadline (soonest first)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="recent" id="sort-recent" />
              <Label htmlFor="sort-recent" className="cursor-pointer">
                Recently Posted
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}
