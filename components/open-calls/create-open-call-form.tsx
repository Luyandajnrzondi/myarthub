"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Upload, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  deadline: z.string().refine(
    (val) => {
      const date = new Date(val)
      const today = new Date()
      return date > today
    },
    {
      message: "Deadline must be in the future.",
    },
  ),
  location: z.string().optional(),
  requirements: z.string().optional(),
  eligibility: z.string().optional(),
  fees: z.string().optional(),
  prizes: z.string().optional(),
})

interface CreateOpenCallFormProps {
  userId: string
}

export function CreateOpenCallForm({ userId }: CreateOpenCallFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      deadline: "",
      location: "",
      requirements: "",
      eligibility: "",
      fees: "",
      prizes: "",
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    const input = document.getElementById("open-call-image") as HTMLInputElement
    if (input) input.value = ""
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      let imageUrl = null

      // If we have an image file, upload it to Supabase Storage
      if (imageFile) {
        // Check if the bucket exists, create it if it doesn't
        const { data: buckets } = await supabase.storage.listBuckets()
        const bucketExists = buckets?.some((bucket) => bucket.name === "open-call-images")

        if (!bucketExists) {
          await supabase.storage.createBucket("open-call-images", {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          })
        }

        // Upload image to Supabase Storage
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${userId}-${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from("open-call-images")
          .upload(filePath, imageFile)

        if (uploadError) {
          console.error("Upload error:", uploadError)
        } else {
          // Get public URL for the uploaded image
          const { data } = supabase.storage.from("open-call-images").getPublicUrl(filePath)
          imageUrl = data.publicUrl
        }
      }

      // Insert open call data into Supabase
      const { error: insertError } = await supabase.from("open_calls").insert({
        organization_id: userId,
        title: values.title,
        description: values.description,
        deadline: new Date(values.deadline).toISOString(),
        location: values.location,
        requirements: values.requirements,
        eligibility: values.eligibility,
        fees: values.fees,
        prizes: values.prizes,
        image_url: imageUrl,
        status: "open",
      })

      if (insertError) {
        throw insertError
      }

      toast({
        title: "Open call created",
        description: "Your open call has been successfully published.",
      })

      router.push("/open-calls")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6 md:col-span-1">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter open call title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the open call and its theme"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadline *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 md:col-span-1">
                <FormItem>
                  <FormLabel>Open Call Image</FormLabel>
                  <div className="flex flex-col items-center justify-center gap-4">
                    {imagePreview ? (
                      <div className="relative">
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          alt="Open call preview"
                          width={400}
                          height={300}
                          className="max-h-[300px] w-auto rounded-md object-contain"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute right-2 top-2"
                          onClick={clearImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex h-64 w-full flex-col items-center justify-center rounded-md border border-dashed">
                        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">Drag and drop or click to upload</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (max. 5MB)</p>
                      </div>
                    )}

                    <Input
                      id="open-call-image"
                      type="file"
                      accept="image/*"
                      className={imagePreview ? "hidden" : ""}
                      onChange={handleImageChange}
                    />
                  </div>
                </FormItem>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Specify submission requirements" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormDescription>
                      Describe what artists need to submit (e.g., file formats, dimensions, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eligibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eligibility</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Specify who can apply" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormDescription>
                      Describe who is eligible to apply (e.g., age, location, experience level)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fees</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Specify any submission fees" className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormDescription>Describe any fees associated with submission</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prizes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prizes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Specify prizes or awards" className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormDescription>
                        Describe any prizes, awards, or opportunities for selected artists
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Open Call"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
