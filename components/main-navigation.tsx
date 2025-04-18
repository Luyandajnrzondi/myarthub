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
import { useState } from "react"

export function MainNavigation() {
  const pathname = usePathname()
  const { user } = useSupabase()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

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
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-primary"></span>
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
