import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Sample artists data
    const artists = [
      {
        id: "sample-artist-1",
        name: "Thandi Ngubane",
        email: "thandi@example.com",
        role: "artist",
        bio: "Contemporary artist specializing in abstract expressionism and mixed media. My work explores themes of identity and cultural heritage.",
        location: "Cape Town",
        website: "thandingubane.com",
        social_links: { instagram: "thandi_art", twitter: "thandi_creates" },
      },
      {
        id: "sample-artist-2",
        name: "Sipho Mabaso",
        email: "sipho@example.com",
        role: "artist",
        bio: "Sculptor and installation artist working with found objects and sustainable materials. My work comments on environmental issues and urban life.",
        location: "Johannesburg",
        website: "siphomabaso.co.za",
        social_links: { instagram: "sipho_sculpts" },
      },
      {
        id: "sample-artist-3",
        name: "Lerato Mokoena",
        email: "lerato@example.com",
        role: "artist",
        bio: "Digital artist and photographer exploring the intersection of technology and traditional African aesthetics.",
        location: "Durban",
        website: "leratoart.com",
        social_links: { instagram: "lerato_digital", twitter: "lerato_creates" },
      },
      {
        id: "sample-curator-1",
        name: "Mandla Nkosi",
        email: "mandla@example.com",
        role: "curator",
        bio: "Independent curator with a focus on emerging African artists. I've organized exhibitions across South Africa and internationally.",
        location: "Pretoria",
        website: "mandlacurates.com",
        social_links: { instagram: "mandla_curates" },
      },
      {
        id: "sample-gallery-1",
        name: "Ubuntu Gallery",
        email: "info@ubuntugallery.com",
        role: "gallery",
        bio: "Contemporary art gallery showcasing the best of South African and African art. We represent both established and emerging artists.",
        location: "Cape Town",
        website: "ubuntugallery.com",
        social_links: { instagram: "ubuntu_gallery", twitter: "ubuntu_art" },
      },
    ]

    // Insert sample artists
    for (const artist of artists) {
      const { error } = await supabase.from("profiles").upsert(artist)
      if (error) console.error(`Error inserting artist ${artist.name}:`, error)
    }

    // Sample artworks data
    const artworks = [
      {
        user_id: "sample-artist-1",
        title: "Echoes of Ancestry",
        description: "An abstract exploration of heritage and identity through vibrant color and dynamic form.",
        medium: "Acrylic on canvas",
        dimensions: "100 x 120 cm",
        year: 2023,
        price: 12000,
        currency: "ZAR",
        status: "available",
        image_url: "/placeholder.svg?height=800&width=600",
        tags: ["abstract", "contemporary", "identity"],
      },
      {
        user_id: "sample-artist-1",
        title: "Urban Rhythms",
        description: "A visual representation of city life and its constant movement and energy.",
        medium: "Mixed media",
        dimensions: "80 x 100 cm",
        year: 2022,
        price: 9500,
        currency: "ZAR",
        status: "available",
        image_url: "/placeholder.svg?height=800&width=600",
        tags: ["cityscape", "mixedmedia", "contemporary"],
      },
      {
        user_id: "sample-artist-2",
        title: "Reclaimed Harmony",
        description:
          "Sculpture created from found objects collected from beaches, exploring our relationship with waste and the environment.",
        medium: "Found objects, metal",
        dimensions: "45 x 30 x 25 cm",
        year: 2023,
        price: 15000,
        currency: "ZAR",
        status: "available",
        image_url: "/placeholder.svg?height=800&width=600",
        tags: ["sculpture", "environmental", "foundmaterials"],
      },
      {
        user_id: "sample-artist-2",
        title: "Urban Decay",
        description: "A commentary on urban development and its impact on communities.",
        medium: "Metal, wood, concrete",
        dimensions: "60 x 40 x 35 cm",
        year: 2021,
        price: 18000,
        currency: "ZAR",
        status: "sold",
        image_url: "/placeholder.svg?height=800&width=600",
        tags: ["sculpture", "urban", "social"],
      },
      {
        user_id: "sample-artist-3",
        title: "Digital Ancestry",
        description: "A digital collage merging traditional African patterns with contemporary digital aesthetics.",
        medium: "Digital print",
        dimensions: "60 x 80 cm",
        year: 2023,
        price: 5000,
        currency: "ZAR",
        status: "available",
        image_url: "/placeholder.svg?height=800&width=600",
        tags: ["digital", "african", "contemporary"],
      },
      {
        user_id: "sample-artist-3",
        title: "Quantum Traditions",
        description:
          "Exploring the intersection of quantum physics concepts with traditional African knowledge systems.",
        medium: "Digital art, printed on archival paper",
        dimensions: "70 x 90 cm",
        year: 2022,
        price: 6500,
        currency: "ZAR",
        status: "available",
        image_url: "/placeholder.svg?height=800&width=600",
        tags: ["digital", "science", "afrofuturism"],
      },
      {
        user_id: "sample-artist-1",
        title: "Ancestral Whispers",
        description:
          "Inspired by dreams and conversations with ancestors, this piece explores the spiritual connections that transcend time.",
        medium: "Oil on canvas",
        dimensions: "90 x 120 cm",
        year: 2021,
        price: 14000,
        currency: "ZAR",
        status: "available",
        image_url: "/placeholder.svg?height=800&width=600",
        tags: ["spiritual", "oilpainting", "abstract"],
      },
      {
        user_id: "sample-artist-2",
        title: "Plastic Ocean",
        description:
          "A sculpture made entirely from plastic waste collected from South African beaches, highlighting marine pollution.",
        medium: "Recycled plastic",
        dimensions: "100 x 80 x 40 cm",
        year: 2022,
        price: 22000,
        currency: "ZAR",
        status: "exhibition",
        image_url: "/placeholder.svg?height=800&width=600",
        tags: ["environmental", "sculpture", "recycled"],
      },
    ]

    // Insert sample artworks
    for (const artwork of artworks) {
      const { error } = await supabase.from("artworks").upsert({
        ...artwork,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      if (error) console.error(`Error inserting artwork ${artwork.title}:`, error)
    }

    return NextResponse.json({
      success: true,
      message: "Sample data seeded successfully",
      data: {
        artists: artists.length,
        artworks: artworks.length,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
