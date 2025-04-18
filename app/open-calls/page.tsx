import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, MapPin, Plus } from "lucide-react"
import { OpenCallFilters } from "@/components/open-calls/open-call-filters"

export default async function OpenCallsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createServerComponentClient({ cookies })

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Parse search params
  const status = typeof searchParams.status === "string" ? searchParams.status : "open"
  const location = typeof searchParams.location === "string" ? searchParams.location : undefined
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "deadline"

  // Build query
  let query = supabase.from("open_calls").select(
    `
      *,
      profiles:organization_id (
        name,
        avatar_url
      )
    `,
  )

  // Apply filters
  if (status !== "all") {
    query = query.eq("status", status)
  }

  if (location) {
    query = query.ilike("location", `%${location}%`)
  }

  // Apply sorting
  if (sort === "deadline") {
    query = query.order("deadline", { ascending: true })
  } else if (sort === "recent") {
    query = query.order("created_at", { ascending: false })
  }

  // Get open calls
  const { data: openCalls } = await query

  // Get unique locations for filter
  const { data: locations } = await supabase.from("open_calls").select("location").not("location", "is", null)
  const uniqueLocations = Array.from(new Set(locations?.map((item) => item.location).filter(Boolean)))

  // Format deadline
  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.toLocaleString("default", { month: "short" })} ${date.getDate()}, ${date.getFullYear()}`
  }

  // Calculate days remaining
  const getDaysRemaining = (dateString: string) => {
    const deadline = new Date(dateString)
    const today = new Date()
    return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Open Calls</h1>

        {session && (
          <Link href="/open-calls/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Open Call
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        <div>
          <OpenCallFilters
            locations={uniqueLocations}
            selectedStatus={status}
            selectedLocation={location}
            selectedSort={sort}
          />
        </div>

        <div className="space-y-6">
          {openCalls && openCalls.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {openCalls.map((openCall) => {
                const daysRemaining = getDaysRemaining(openCall.deadline)
                const isExpired = daysRemaining < 0

                return (
                  <Card key={openCall.id} className="overflow-hidden flex flex-col">
                    {openCall.image_url && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={openCall.image_url || "/placeholder.svg"}
                          alt={openCall.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant={isExpired ? "destructive" : daysRemaining < 7 ? "secondary" : "outline"}>
                          {isExpired ? "Closed" : daysRemaining === 0 ? "Closing Today" : `${daysRemaining} days left`}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          Posted {new Date(openCall.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <CardTitle className="mt-2 line-clamp-2">{openCall.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2 flex-1">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">{openCall.description}</p>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <span>Deadline: {formatDeadline(openCall.deadline)}</span>
                          </div>
                          {openCall.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{openCall.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4 border-t mt-auto">
                      <div className="flex items-center gap-2 w-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={openCall.profiles.avatar_url || "/placeholder.svg"}
                            alt={openCall.profiles.name}
                          />
                          <AvatarFallback>{openCall.profiles.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{openCall.profiles.name}</p>
                        </div>
                        <Link href={`/open-calls/${openCall.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">No open calls found matching your criteria</p>
              <Button variant="outline" asChild>
                <Link href="/open-calls?status=all">View All Open Calls</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
