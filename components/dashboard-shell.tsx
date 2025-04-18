import type React from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { MainNav } from "@/components/main-nav"
import { UserAccountNav } from "@/components/user-account-nav"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

interface DashboardShellProps {
  children?: React.ReactNode
}

export async function DashboardShell({ children }: DashboardShellProps) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get user profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session?.user.id || "")
    .single()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav />
          <UserAccountNav
            user={{
              name: profile?.name || session?.user?.user_metadata?.name || "",
              email: session?.user?.email || "",
              image: profile?.avatar_url || null,
            }}
          />
        </div>
      </header>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          <DashboardNav />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden py-6">{children}</main>
      </div>
    </div>
  )
}
