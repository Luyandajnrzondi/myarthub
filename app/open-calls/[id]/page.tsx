import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, MapPin, ArrowLeft, Clock, Users, Award, DollarSign } from "lucide-react"
import { OpenCallSubmissionForm } from "@/components/open-calls/submission-form"

export default async function OpenCallDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // Get open call data
  const { data: openCall, error: openCallError } = await supabase
    .from("open_calls")
    .select(
      `
      *,
      profiles:organization_id (
        id,
        name,
        avatar_url,
        bio,
        location,
        website,
        social_links
      )
    `,
    )
    .eq("id", params.id)
    .single()

  if (openCallError || !openCall) {
    notFound()
  }

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if user has already submitted to this open call
  let hasSubmitted = false
  if (session?.user?.id) {
    const { data: submission } = await supabase
      .from("open_call_submissions")
      .select("id")
      .eq("open_call_id", params.id)
      .eq("user_id", session.user.id)
      .maybeSingle()

    hasSubmitted = !!submission
  }

  // Get user's artworks for submission
  let userArtworks = []
  if (session?.user?.id) {
    const { data: artworks } = await supabase
      .from("artworks")
      .select("id, title, image_url")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    userArtworks = artworks || []
  }

  // Format deadline
  const deadline = new Date(openCall.deadline)
  const formattedDeadline = deadline.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Calculate days remaining
  const today = new Date()
  const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const isExpired = daysRemaining < 0

  return (
    <div className="container py-8">
      <Button variant="ghost" asChild className="mb-4 -ml-3">
        <Link href="/open-calls" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Open Calls
        </Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant={isExpired ? "destructive" : "default"} className="text-sm">
                {isExpired ? "Closed" : daysRemaining === 0 ? "Closing Today" : `${daysRemaining} days remaining`}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Posted on {new Date(openCall.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-3xl font-bold">{openCall.title}</h1>
            <p className="text-lg text-muted-foreground">{openCall.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Deadline</p>
                  <p className="text-sm text-muted-foreground">{formattedDeadline}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{openCall.location || "Not specified"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Requirements</h2>
            <p className="text-muted-foreground">{openCall.requirements || "No specific requirements provided."}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Eligibility</h2>
            <p className="text-muted-foreground">
              {openCall.eligibility || "No specific eligibility criteria provided."}
            </p>
          </div>

          {openCall.fees && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Fees</h2>
              <p className="text-muted-foreground">{openCall.fees}</p>
            </div>
          )}

          {openCall.prizes && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Prizes</h2>
              <p className="text-muted-foreground">{openCall.prizes}</p>
            </div>
          )}

          {!isExpired && session?.user?.id && session?.user?.id !== openCall.organization_id && (
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Your Work</CardTitle>
                  <CardDescription>
                    {hasSubmitted
                      ? "You have already submitted to this open call."
                      : "Complete the form below to submit your work to this open call."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hasSubmitted ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">
                        Your submission is being reviewed. You will be notified of any updates.
                      </p>
                    </div>
                  ) : (
                    <OpenCallSubmissionForm openCallId={params.id} userId={session.user.id} artworks={userArtworks} />
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organized by</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={openCall.profiles.avatar_url || "/placeholder.svg"} alt={openCall.profiles.name} />
                  <AvatarFallback>{openCall.profiles.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/profile/${openCall.profiles.id}`} className="font-medium hover:underline">
                    {openCall.profiles.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{openCall.profiles.location}</p>
                </div>
              </div>
              {openCall.profiles.bio && <p className="text-sm text-muted-foreground">{openCall.profiles.bio}</p>}
              {openCall.profiles.website && (
                <Link
                  href={
                    openCall.profiles.website.startsWith("http")
                      ? openCall.profiles.website
                      : `https://${openCall.profiles.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Visit Website
                </Link>
              )}
            </CardContent>
            <CardFooter>
              <Link href={`/profile/${openCall.profiles.id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  View Profile
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Deadline</p>
                  <p className="text-sm text-muted-foreground">{formattedDeadline}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Eligibility</p>
                  <p className="text-sm text-muted-foreground">{openCall.eligibility || "Open to all artists"}</p>
                </div>
              </div>
              {openCall.fees && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Fees</p>
                    <p className="text-sm text-muted-foreground">{openCall.fees}</p>
                  </div>
                </div>
              )}
              {openCall.prizes && (
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Prizes</p>
                    <p className="text-sm text-muted-foreground">{openCall.prizes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {openCall.image_url && (
            <div className="overflow-hidden rounded-lg border">
              <Image
                src={openCall.image_url || "/placeholder.svg"}
                alt={openCall.title}
                width={600}
                height={400}
                className="w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
