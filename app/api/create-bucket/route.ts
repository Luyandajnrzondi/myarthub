import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Create a new storage bucket for artwork images
    const { data, error } = await supabase.storage.createBucket("artwork-images", {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
