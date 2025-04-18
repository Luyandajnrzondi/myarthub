"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface Artwork {
  id: string
  title: string
  image_url: string
}

interface OpenCallSubmissionFormProps {
  openCallId: string
  userId: string
  artworks: Artwork[]
}

const formSchema = z.object({
  artwork_id: z.string({
    required_error: "Please select an artwork to submit.",
  }),
  statement: z
    .string()
    .min(10, {
      message: "Statement must be at least 10 characters.",
    })
    .max(1000, {
      message: "Statement must not exceed 1000 characters.",
    }),
})

export function OpenCallSubmissionForm({ openCallId, userId, artworks }: OpenCallSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      artwork_id: "",
      statement: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (artworks.length === 0) {
      toast({
        title: "No artworks available",
        description: "You need to upload artworks before you can submit to an open call.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from("open_call_submissions").insert({
        open_call_id: openCallId,
        user_id: userId,
        artwork_id: values.artwork_id,
        statement: values.statement,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Submission successful",
        description: "Your work has been submitted to the open call.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (artworks.length === 0) {
    return (
      <div className="text-center py-4 space-y-4">
        <p className="text-muted-foreground">You need to upload artworks before you can submit to an open call.</p>
        <Link href="/upload">
          <Button>Upload Artwork</Button>
        </Link>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="artwork_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Artwork</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an artwork to submit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {artworks.map((artwork) => (
                    <SelectItem key={artwork.id} value={artwork.id}>
                      {artwork.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Choose one of your artworks to submit to this open call.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="statement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artist Statement</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Explain how your work relates to the theme of this open call..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a statement about your work and how it relates to the open call.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </form>
    </Form>
  )
}
