"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/supabase-provider"
import { LayoutDashboard, User, ImageIcon, MessageSquare, Bell, Settings, PlusCircle } from "lucide-react"
import { useState, useEffect } from "react"

export function DashboardNav() {
  const pathname = usePathname()
  const { user } = useSupabase()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (user?.user_metadata?.role) {
      setUserRole(user.user_metadata.role)
    }
  }, [user])

  const routes = [
    {
      href: `/dashboard`,
      label: "Overview",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    },
    {
      href: `/dashboard/profile`,
      label: "Profile",
      icon: <User className="mr-2 h-4 w-4" />,
    },
    {
      href: `/dashboard/${userRole === "artist" ? "artworks" : userRole === "curator" ? "curations" : "exhibitions"}`,
      label: userRole === "artist" ? "Artworks" : userRole === "curator" ? "Curations" : "Exhibitions",
      icon: <ImageIcon className="mr-2 h-4 w-4" />,
    },
    {
      href: `/dashboard/messages`,
      label: "Messages",
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
    },
    {
      href: `/dashboard/notifications`,
      label: "Notifications",
      icon: <Bell className="mr-2 h-4 w-4" />,
    },
    {
      href: `/dashboard/settings`,
      label: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <nav className="grid items-start gap-2">
      {routes.map((route) => (
        <Link key={route.href} href={route.href}>
          <Button
            variant={pathname === route.href ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              pathname === route.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
            )}
          >
            {route.icon}
            {route.label}
          </Button>
        </Link>
      ))}
      <Button className="mt-4 w-full justify-start" variant="outline">
        <PlusCircle className="mr-2 h-4 w-4" />
        {userRole === "artist" ? "Upload Artwork" : userRole === "curator" ? "Create Curation" : "Add Exhibition"}
      </Button>
    </nav>
  )
}
