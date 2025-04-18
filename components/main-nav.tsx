import Link from "next/link"
import { Palette } from "lucide-react"

export function MainNav() {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Palette className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">ArtHub</span>
      </Link>
      <nav className="flex gap-6">
        <Link
          href="/dashboard"
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Dashboard
        </Link>
        <Link
          href="/explore"
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Explore
        </Link>
        <Link
          href="/open-calls"
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Open Calls
        </Link>
      </nav>
    </div>
  )
}
