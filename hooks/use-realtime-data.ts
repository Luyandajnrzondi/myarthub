"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface UseRealtimeDataProps<T> {
  table: string
  event?: "INSERT" | "UPDATE" | "DELETE" | "*"
  initialData: T[]
  onInsert?: (item: T) => void
  onUpdate?: (item: T) => void
  onDelete?: (item: T) => void
  filter?: string
  filterValue?: any
}

export function useRealtimeData<T>({
  table,
  event = "*",
  initialData = [] as T[],
  onInsert,
  onUpdate,
  onDelete,
  filter,
  filterValue,
}: UseRealtimeDataProps<T>) {
  const [data, setData] = useState<T[]>(initialData)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Create a channel for the specified table
    const newChannel = supabase
      .channel(`${table}-changes`)
      .on(
        "postgres_changes",
        {
          event,
          schema: "public",
          table,
          filter: filter ? `${filter}=eq.${filterValue}` : undefined,
        },
        (payload) => {
          const newRecord = payload.new as T
          const oldRecord = payload.old as T

          if (payload.eventType === "INSERT") {
            setData((currentData) => [newRecord, ...currentData])
            onInsert?.(newRecord)
          } else if (payload.eventType === "UPDATE") {
            setData((currentData) =>
              currentData.map((item) => {
                // @ts-ignore - we don't know the shape of T
                if (item.id === newRecord.id) {
                  return newRecord
                }
                return item
              }),
            )
            onUpdate?.(newRecord)
          } else if (payload.eventType === "DELETE") {
            setData((currentData) =>
              currentData.filter((item) => {
                // @ts-ignore - we don't know the shape of T
                return item.id !== oldRecord.id
              }),
            )
            onDelete?.(oldRecord)
          }
        },
      )
      .subscribe()

    setChannel(newChannel)

    // Cleanup function
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, event, filter, filterValue])

  return { data, channel }
}
