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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Upload, X } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  medium: z.string().optional(),
  dimensions: z.string().optional(),
  year: z
    .string()
    .refine((val) => !val || /^\d{4}$/.test(val), {
      message: "Year must be a 4-digit number.",
    })
    .optional()
    .transform((val) => (val ? Number.parseInt(val) : undefined)),
  price: z
    .string()
    .refine((val) => !val || /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Price must be a valid number.",
    })
    .optional()
    .transform((val) => (val ? Number.parseFloat(val) : undefined)),
  status: z.enum(["available", "sold", "not_for_sale", "exhibition"]),
  tags: z.string().optional(),
})

interface UploadArtworkFormProps {
  userId: string
}

export function UploadArtworkForm({ userId }: UploadArtworkFormProps) {
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
      medium: "",
      dimensions: "",
      year: "",
      price: "",
      status: "available",
      tags: "",
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
    const input = document.getElementById("artwork-image") as HTMLInputElement
    if (input) input.value = ""
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!imageFile) {
      toast({
        title: "Image required",
        description: "Please upload an image of your artwork",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Upload image to Supabase Storage
      const fileExt = imageFile.name.split(".").pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `artworks/${fileName}`

      const { error: uploadError } = await supabase.storage.from("artwork-images").upload(filePath, imageFile)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL for the uploaded image
      const {
        data: { publicUrl },
      } = supabase.storage.from("artwork-images").getPublicUrl(filePath)

      // Process tags
      const tagsArray = values.tags
        ? values.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : []

      // Insert artwork data into Supabase
      const { error: insertError } = await supabase.from("artworks").insert({
        user_id: userId,
        title: values.title,
        description: values.description,
        medium: values.medium,
        dimensions: values.dimensions,
        year: values.year,
        price: values.price,
        status: values.status,
        image_url: publicUrl,
        tags: tagsArray,
      })

      if (insertError) {
        throw insertError
      }

      toast({
        title: "Artwork uploaded",
        description: "Your artwork has been successfully uploaded.",
      })

      router.push(`/profile/${userId}`)
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter artwork title" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your artwork" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="medium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medium</FormLabel>
                    <FormControl>
                      <Input placeholder="Oil on canvas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dimensions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dimensions</FormLabel>
                    <FormControl>
                      <Input placeholder="24 x 36 inches" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input placeholder="2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input placeholder="1000.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="not_for_sale">Not For Sale</SelectItem>
                      <SelectItem value="exhibition">Exhibition Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="abstract, portrait, landscape" {...field} />
                  </FormControl>
                  <FormDescription>Separate tags with commas</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormItem>
              <FormLabel>Artwork Image *</FormLabel>
              <div className="flex flex-col items-center justify-center gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Artwork preview"
                      width={400}
                      height={400}
                      className="max-h-[400px] w-auto rounded-md object-contain"
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
                  id="artwork-image"
                  type="file"
                  accept="image/*"
                  className={imagePreview ? "hidden" : ""}
                  onChange={handleImageChange}
                />
              </div>
            </FormItem>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Artwork"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
