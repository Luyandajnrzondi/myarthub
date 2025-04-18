import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirectTo=/admin")
  }

  // Check if user is an admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

  if (!profile?.is_admin) {
    redirect("/")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <AdminDashboard userId={session.user.id} />
    </div>
  )
}
