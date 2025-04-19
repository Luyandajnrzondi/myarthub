"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { RealtimeChannel } from "@supabase/supabase-js"

type SupabaseEvent = "INSERT" | "UPDATE" | "DELETE" | "*"

interface UseRealtimeDataOptions<T> {
  table: string
  schema?: string
  event?: SupabaseEvent
  filter?: string
  initialData?: T[]
  onInsert?: (item: T) => void
  onUpdate?: (item: T) => void
  onDelete?: (item: T) => void
}

export function useRealtimeData<T>({
  table,
  schema = "public",
  event = "*",
  filter,
  initialData = [],
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeDataOptions<T>) {
  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    let channel: RealtimeChannel

    const setupSubscription = async () => {
      try {
        // Create a channel for real-time updates
        const channelName = `${table}-changes`
        channel = supabase.channel(channelName)

        // Set up the subscription
        channel
          .on(
            "postgres_changes",
            {
              event,
              schema,
              table,
              filter,
            },
            (payload) => {
              const newItem = payload.new as T
              const oldItem = payload.old as T

              if (payload.eventType === "INSERT") {
                setData((current) => [...current, newItem])
                onInsert?.(newItem)
              } else if (payload.eventType === "UPDATE") {
                setData((current) =>
                  current.map((item) => {
                    // @ts-ignore - we're assuming items have an id
                    if (item.id === newItem.id) {
                      return newItem
                    }
                    return item
                  }),
                )
                onUpdate?.(newItem)
              } else if (payload.eventType === "DELETE") {
                setData((current) =>
                  current.filter((item) => {
                    // @ts-ignore - we're assuming items have an id
                    return item.id !== oldItem.id
                  }),
                )
                onDelete?.(oldItem)
              }
            },
          )
          .subscribe()

        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
      }
    }

    setupSubscription()

    return () => {
      // Clean up the subscription when the component unmounts
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, schema, event, filter, supabase, onInsert, onUpdate, onDelete])

  return { data, setData, loading, error }
}
