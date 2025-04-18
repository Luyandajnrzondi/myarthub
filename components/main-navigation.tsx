"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Palette, Search, Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useSupabase } from "@/components/supabase-provider"
import { UserAccountNav } from "@/components/user-account-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function MainNavigation() {
  const pathname = usePathname()
  const { user } = useSupabase()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!user) return

    const fetchUnreadCount = async () => {
      // Get all conversations where the user is a participant
      const { data: participations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id)

      if (!participations || participations.length === 0) {
        setUnreadCount(0)
        return
      }

      const conversationIds = participations.map((p) => p.conversation_id)

      // Get unread messages count
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact" })
        .in("conversation_id", conversationIds)
        .eq("read", false)
        .neq("user_id", user.id)

      setUnreadCount(count || 0)
    }

    fetchUnreadCount()

    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel("messages_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          // Only update count if message is not from current user
          if (payload.new.user_id !== user.id) {
            setUnreadCount((prev) => prev + 1)
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `read=eq.true`,
        },
        () => {
          // Refresh count when messages are marked as read
          fetchUnreadCount()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user, supabase])

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/explore",
      label: "Explore",
      active: pathname === "/explore",
    },
    {
      href: "/timeline",
      label: "Timeline",
      active: pathname === "/timeline",
    },
    {
      href: "/artists",
      label: "Artists",
      active: pathname === "/artists",
    },
    {
      href: "/open-calls",
      label: "Open Calls",
      active: pathname === "/open-calls",
    },
    {
      href: "/about",
      label: "About",
      active: pathname === "/about",
    },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Palette className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">ArtHub</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  route.active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className={cn("flex-1 md:flex-none", isSearchOpen ? "flex" : "hidden md:flex")}>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search artists, artworks..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[300px]"
              />
            </div>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <Search className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          {user ? (
            <>
              <Link href="/messages">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <UserAccountNav />
            </>
          ) : (
            <div className="hidden sm:flex gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-4 py-4">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      route.active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {route.label}
                  </Link>
                ))}
                {!user && (
                  <>
                    <Link
                      href="/login"
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
