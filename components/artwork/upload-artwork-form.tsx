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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
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
  price: z
    .string()
    .refine((val) => !val || /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Price must be a valid number.",
    })
    .optional()
    .transform((val) => (val ? Number.parseFloat(val) : undefined)),
  currency: z.enum(["ZAR", "USD", "EUR", "GBP"]),
  status: z.enum(["available", "sold", "not_for_sale"]),
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
      price: "",
      currency: "ZAR",
      status: "available",
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
    if (!imageFile && !imagePreview) {
      toast({
        title: "Image required",
        description: "Please upload an image of your artwork",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      let publicUrl = ""

      // If we have a real file, upload it to Supabase Storage
      if (imageFile) {
        // Check if the bucket exists, create it if it doesn't
        const { data: buckets } = await supabase.storage.listBuckets()
        const bucketExists = buckets?.some((bucket) => bucket.name === "artwork-images")

        if (!bucketExists) {
          await supabase.storage.createBucket("artwork-images", {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          })
        }

        // Upload image to Supabase Storage
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${userId}-${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage.from("artwork-images").upload(filePath, imageFile)

        if (uploadError) {
          console.error("Upload error:", uploadError)
          publicUrl = "/placeholder.svg"
        } else {
          // Get public URL for the uploaded image
          const { data } = supabase.storage.from("artwork-images").getPublicUrl(filePath)
          publicUrl = data.publicUrl
        }
      } else {
        // Use a placeholder if no real file
        publicUrl = "/placeholder.svg"
      }

      // Insert artwork data into Supabase
      const { error: insertError } = await supabase.from("artworks").insert({
        user_id: userId,
        title: values.title,
        description: values.description,
        medium: values.medium,
        price: values.price,
        currency: values.currency,
        status: values.status,
        image_url: publicUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        throw insertError
      }

      toast({
        title: "Artwork uploaded",
        description: "Your artwork has been successfully uploaded.",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      console.error("Upload error:", error)
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input placeholder="1000.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ZAR">ZAR (R)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
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
                    </SelectContent>
                  </Select>
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
