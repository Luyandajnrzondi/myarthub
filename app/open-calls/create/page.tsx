import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { CreateOpenCallForm } from "@/components/open-calls/create-open-call-form"

export default async function CreateOpenCallPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirectTo=/open-calls/create")
  }

  // Get user profile to check role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  // Only galleries, curators, and admins can create open calls
  if (!profile || (profile.role !== "gallery" && profile.role !== "curator" && profile.role !== "admin")) {
    redirect("/open-calls?error=unauthorized")
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create Open Call</h1>
        <CreateOpenCallForm userId={session.user.id} />
      </div>
    </div>
  )
}
