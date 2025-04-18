import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileTabs } from "@/components/profile/profile-tabs"

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // Get profile data
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Get user's artworks
  const { data: artworks } = await supabase
    .from("artworks")
    .select("*")
    .eq("user_id", params.id)
    .order("created_at", { ascending: false })

  // Check if this is the current user's profile
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isCurrentUser = session?.user?.id === params.id

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader profile={profile} isCurrentUser={isCurrentUser} />
      <ProfileTabs profile={profile} artworks={artworks || []} isCurrentUser={isCurrentUser} />
    </div>
  )
}
