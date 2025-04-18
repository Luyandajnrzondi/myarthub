import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Plus } from "lucide-react"

export default async function OpenCallsPage() {
  // This is a placeholder for now - we'll implement the open calls feature later
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Open Calls</h1>

        <Link href="/open-calls/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Open Call
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant={i % 3 === 0 ? "default" : i % 3 === 1 ? "secondary" : "outline"}>
                  {i % 3 === 0 ? "Open" : i % 3 === 1 ? "Closing Soon" : "Closed"}
                </Badge>
                <p className="text-sm text-muted-foreground">Posted 2 days ago</p>
              </div>
              <CardTitle className="mt-2 line-clamp-2">
                {
                  [
                    "Annual Portrait Exhibition",
                    "Emerging Artists Showcase",
                    "Digital Art Competition",
                    "Contemporary Sculpture Exhibition",
                    "Photography Open Call",
                    "Abstract Art Exhibition",
                  ][i % 6]
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {
                    [
                      "We're looking for innovative portrait works in any medium that challenge traditional notions of portraiture.",
                      "A platform for emerging artists to showcase their work and gain exposure in the art community.",
                      "Exploring the intersection of technology and art through digital mediums.",
                      "Seeking sculptural works that push the boundaries of form, material, and concept.",
                      "Open call for photographers working in all styles and approaches.",
                      "Abstract works that explore color, form, and composition in new and exciting ways.",
                    ][i % 6]
                  }
                </p>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>Deadline: {["May 15", "June 30", "July 10", "Aug 5", "Sept 20", "Oct 15"][i % 6]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {["Cape Town", "Johannesburg", "Durban", "Pretoria", "Bloemfontein", "Port Elizabeth"][i % 6]}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/open-calls/${i + 1}`} className="w-full">
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
