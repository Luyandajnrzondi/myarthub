import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Palette, Users, Calendar, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Palette className="h-6 w-6" />
            <span>ArtHub</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/explore" className="text-sm font-medium hover:underline underline-offset-4">
              Explore
            </Link>
            <Link href="/open-calls" className="text-sm font-medium hover:underline underline-offset-4">
              Open Calls
            </Link>
            <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
          </nav>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Connect with the Art World
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  ArtHub connects visual artists, curators, and galleries through a social inventory system. Showcase
                  your artwork, build your profile, and discover new opportunities.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button className="px-8">
                      Join Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/explore">
                    <Button variant="outline" className="px-8">
                      Explore Art
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto w-full max-w-[500px] aspect-video rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Palette className="h-12 w-12 mx-auto text-gray-500" />
                  <p className="text-sm text-gray-500">Art showcase preview</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why Join ArtHub?</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Discover the benefits of our platform for artists, curators, and galleries.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center">
                <Palette className="mx-auto h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Showcase Your Art</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Create a beautiful portfolio to display your artwork to a global audience.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <Users className="mx-auto h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Connect with Professionals</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Network with curators, galleries, and fellow artists to grow your career.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <Calendar className="mx-auto h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Discover Opportunities</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Find open calls, exhibitions, and collaboration opportunities.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col gap-4 px-4 md:flex-row md:items-center md:gap-8 md:px-6">
          <div className="flex items-center gap-2 font-bold">
            <Palette className="h-5 w-5" />
            <span>ArtHub</span>
          </div>
          <nav className="flex gap-4 md:gap-6 md:ml-auto">
            <Link href="/terms" className="text-xs hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link href="/contact" className="text-xs hover:underline underline-offset-4">
              Contact
            </Link>
          </nav>
          <div className="md:ml-auto md:text-right text-xs text-gray-500">© 2024 ArtHub. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
