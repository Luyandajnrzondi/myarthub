"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronRight, Loader2 } from "lucide-react"

interface OpenCall {
  id: string
  title: string
  description: string
  deadline: string
  organization_id: string
  profiles: {
    name: string
    avatar_url: string | null
  }
}

export function CurrentOpenCalls() {
  const [openCalls, setOpenCalls] = useState<OpenCall[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchOpenCalls = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("open_calls")
        .select(
          `
          id, title, description, deadline, organization_id,
          profiles:organization_id (name, avatar_url)
        `,
        )
        .eq("status", "open")
        .order("deadline", { ascending: true })
        .limit(3)

      if (!error && data) {
        setOpenCalls(data)
      }
      setIsLoading(false)
    }

    fetchOpenCalls()
  }, [supabase])

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.toLocaleString("default", { month: "short" })} ${date.getDate()}, ${date.getFullYear()}`
  }

  return (
    <section className="py-12 bg-black text-white">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Current Open Calls</h2>
          <Link href="/open-calls">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-white hover:text-white hover:bg-white/10"
            >
              View all open calls
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : openCalls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {openCalls.map((openCall) => (
              <Card key={openCall.id} className="bg-zinc-900 border-zinc-800 text-white">
                <CardContent className="p-6">
                  <Badge className="mb-4 bg-white/10 hover:bg-white/20 text-white">
                    Deadline: {formatDeadline(openCall.deadline)}
                  </Badge>
                  <h3 className="text-xl font-bold mb-2">{openCall.title}</h3>
                  <p className="text-zinc-400 mb-4 line-clamp-3">{openCall.description}</p>

                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={openCall.profiles.avatar_url || "/placeholder.svg"}
                        alt={openCall.profiles.name}
                      />
                      <AvatarFallback>{openCall.profiles.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-zinc-300">{openCall.profiles.name}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Link href={`/open-calls/${openCall.id}`} className="w-full">
                    <Button className="w-full bg-white text-black hover:bg-white/90">Apply Now</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex justify-center py-12 text-zinc-400">
            <p>No open calls available at the moment</p>
          </div>
        )}
      </div>
    </section>
  )
}
