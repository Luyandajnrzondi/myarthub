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
        avatar_url: "https://i.pravatar.cc/300?img=1",
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
        avatar_url: "https://i.pravatar.cc/300?img=3",
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
        avatar_url: "https://i.pravatar.cc/300?img=5",
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
        avatar_url: "https://i.pravatar.cc/300?img=7",
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
        avatar_url: "https://i.pravatar.cc/300?img=9",
      },
      {
        id: "sample-admin-1",
        name: "Admin User",
        email: "admin@arthub.com",
        role: "admin",
        bio: "ArtHub platform administrator.",
        is_admin: true,
        avatar_url: "https://i.pravatar.cc/300?img=11",
      },
      {
        id: "city-gallery",
        name: "City Gallery",
        email: "info@citygallery.com",
        role: "gallery",
        bio: "A contemporary art gallery in the heart of the city, showcasing urban and contemporary art from emerging and established artists.",
        location: "Cape Town",
        website: "citygallery.com",
        social_links: { instagram: "city_gallery", twitter: "city_gallery_art" },
        avatar_url: "https://i.pravatar.cc/300?img=13",
      },
      {
        id: "tech-museum",
        name: "Tech Museum",
        email: "info@techmuseum.org",
        role: "gallery",
        bio: "A museum dedicated to the intersection of technology and art, showcasing digital and new media artworks.",
        location: "Johannesburg",
        website: "techmuseum.org",
        social_links: { instagram: "tech_museum", twitter: "tech_museum_art" },
        avatar_url: "https://i.pravatar.cc/300?img=15",
      },
      {
        id: "eco-art-foundation",
        name: "Eco Art Foundation",
        email: "info@ecoartfoundation.org",
        role: "gallery",
        bio: "A foundation dedicated to promoting art that addresses environmental issues and sustainability.",
        location: "Durban",
        website: "ecoartfoundation.org",
        social_links: { instagram: "eco_art", twitter: "eco_art_foundation" },
        avatar_url: "https://i.pravatar.cc/300?img=17",
      },
    ]

    // Insert sample artists
    for (const artist of artists) {
      const { error } = await supabase.from("profiles").upsert(artist)
      if (error) console.error(`Error inserting artist ${artist.name}:`, error)
    }

    // Sample artworks data with real image URLs
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
        image_url: "https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?w=800&auto=format&fit=crop",
        tags: ["abstract", "contemporary", "identity"],
        view_count: Math.floor(Math.random() * 500) + 50,
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
        image_url: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&auto=format&fit=crop",
        tags: ["cityscape", "mixedmedia", "contemporary"],
        view_count: Math.floor(Math.random() * 500) + 50,
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
        image_url: "https://images.unsplash.com/photo-1554188248-986adbb73be4?w=800&auto=format&fit=crop",
        tags: ["sculpture", "environmental", "foundmaterials"],
        view_count: Math.floor(Math.random() * 500) + 50,
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
        image_url: "https://images.unsplash.com/photo-1561839561-b13bcfe95249?w=800&auto=format&fit=crop",
        tags: ["sculpture", "urban", "social"],
        view_count: Math.floor(Math.random() * 500) + 50,
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
        image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
        tags: ["digital", "african", "contemporary"],
        view_count: Math.floor(Math.random() * 500) + 50,
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
        image_url: "https://images.unsplash.com/photo-1622737133809-d95047b9e673?w=800&auto=format&fit=crop",
        tags: ["digital", "science", "afrofuturism"],
        view_count: Math.floor(Math.random() * 500) + 50,
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
        image_url: "https://images.unsplash.com/photo-1578926288207-32356a8016e5?w=800&auto=format&fit=crop",
        tags: ["spiritual", "oilpainting", "abstract"],
        view_count: Math.floor(Math.random() * 500) + 50,
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
        image_url: "https://images.unsplash.com/photo-1576020799627-aeac74d58d8d?w=800&auto=format&fit=crop",
        tags: ["environmental", "sculpture", "recycled"],
        view_count: Math.floor(Math.random() * 500) + 50,
      },
      {
        user_id: "sample-artist-3",
        title: "Urban Perspectives",
        description: "A series exploring the urban landscape through a digital lens.",
        medium: "Digital photography",
        dimensions: "60 x 80 cm",
        year: 2023,
        price: 7500,
        currency: "ZAR",
        status: "available",
        image_url: "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=800&auto=format&fit=crop",
        tags: ["photography", "urban", "digital"],
        view_count: Math.floor(Math.random() * 500) + 50,
      },
      {
        user_id: "sample-artist-1",
        title: "Harmony in Chaos",
        description: "Finding order and beauty in the seemingly chaotic patterns of nature and urban environments.",
        medium: "Mixed media on canvas",
        dimensions: "100 x 100 cm",
        year: 2022,
        price: 11000,
        currency: "ZAR",
        status: "available",
        image_url: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=800&auto=format&fit=crop",
        tags: ["abstract", "mixedmedia", "pattern"],
        view_count: Math.floor(Math.random() * 500) + 50,
      },
      {
        user_id: "sample-artist-2",
        title: "Industrial Evolution",
        description: "A sculptural commentary on the evolution of industry and its impact on society.",
        medium: "Metal, wood, found objects",
        dimensions: "120 x 80 x 60 cm",
        year: 2021,
        price: 19500,
        currency: "ZAR",
        status: "available",
        image_url: "https://images.unsplash.com/photo-1629976002377-aad3c9a2cd9e?w=800&auto=format&fit=crop",
        tags: ["sculpture", "industrial", "social"],
        view_count: Math.floor(Math.random() * 500) + 50,
      },
      {
        user_id: "sample-artist-3",
        title: "Digital Dreamscapes",
        description: "Surreal digital landscapes that blur the line between reality and imagination.",
        medium: "Digital art",
        dimensions: "70 x 100 cm",
        year: 2023,
        price: 8500,
        currency: "ZAR",
        status: "available",
        image_url: "https://images.unsplash.com/photo-1633177317976-3f9bc45e1d1d?w=800&auto=format&fit=crop",
        tags: ["digital", "surreal", "landscape"],
        view_count: Math.floor(Math.random() * 500) + 50,
      },
    ]

    // Insert sample artworks and get their IDs
    const artworkIds = []
    for (const artwork of artworks) {
      const { data, error } = await supabase
        .from("artworks")
        .upsert({
          ...artwork,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")

      if (error) {
        console.error(`Error inserting artwork ${artwork.title}:`, error)
      } else if (data && data.length > 0) {
        artworkIds.push(data[0].id)
      }
    }

    // Sample open calls
    const openCalls = [
      {
        organization_id: "city-gallery",
        title: "Urban Perspectives",
        description: "A juried exhibition exploring the relationship between humans and urban environments.",
        deadline: new Date(2024, 7, 15).toISOString(), // August 15, 2024
        location: "Cape Town",
        requirements: "Submit up to 3 artworks that explore urban themes. All mediums accepted.",
        eligibility: "Open to all artists residing in South Africa.",
        fees: "R200 submission fee",
        prizes: "First Prize: R10,000, Second Prize: R5,000, Third Prize: R2,500",
        image_url: "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=800&auto=format&fit=crop",
        status: "open",
      },
      {
        organization_id: "tech-museum",
        title: "Digital Frontiers",
        description: "Showcasing innovative digital art that pushes the boundaries of technology and creativity.",
        deadline: new Date(2024, 8, 30).toISOString(), // September 30, 2024
        location: "Johannesburg",
        requirements:
          "Submit digital artworks including but not limited to: digital painting, 3D modeling, AI art, VR/AR experiences.",
        eligibility: "Open to all digital artists worldwide.",
        fees: "No submission fee",
        prizes: "Exhibition opportunity and R15,000 for the selected artist",
        image_url: "https://images.unsplash.com/photo-1633177317976-3f9bc45e1d1d?w=800&auto=format&fit=crop",
        status: "open",
      },
      {
        organization_id: "eco-art-foundation",
        title: "Nature Reimagined",
        description: "An exploration of the natural world through contemporary artistic practices.",
        deadline: new Date(2024, 9, 15).toISOString(), // October 15, 2024
        location: "Durban",
        requirements: "Submit artworks that engage with themes of nature, ecology, and environmental awareness.",
        eligibility: "Open to all artists with a focus on environmental themes.",
        fees: "R150 submission fee",
        prizes: "Exhibition opportunity and R8,000 for selected artists",
        image_url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&auto=format&fit=crop",
        status: "open",
      },
      {
        organization_id: "sample-gallery-1",
        title: "Emerging Voices",
        description: "A platform for emerging artists to showcase their unique perspectives and talents.",
        deadline: new Date(2024, 10, 20).toISOString(), // November 20, 2024
        location: "Cape Town",
        requirements: "Submit a portfolio of 5-10 artworks that represent your artistic voice.",
        eligibility: "Open to artists who have not had a solo exhibition before.",
        fees: "No submission fee",
        prizes: "Solo exhibition opportunity at Ubuntu Gallery",
        image_url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop",
        status: "open",
      },
      {
        organization_id: "sample-curator-1",
        title: "Identity and Heritage",
        description: "An exhibition exploring themes of cultural identity, heritage, and belonging.",
        deadline: new Date(2024, 11, 10).toISOString(), // December 10, 2024
        location: "Pretoria",
        requirements: "Submit artworks that engage with themes of identity, heritage, and cultural expression.",
        eligibility: "Open to all South African artists.",
        fees: "R100 submission fee",
        prizes: "Exhibition opportunity and R5,000 for selected artists",
        image_url: "https://images.unsplash.com/photo-1578926288207-32356a8016e5?w=800&auto=format&fit=crop",
        status: "open",
      },
    ]

    // Insert sample open calls
    const openCallIds = []
    for (const openCall of openCalls) {
      const { data, error } = await supabase.from("open_calls").upsert(openCall).select("id")

      if (error) {
        console.error(`Error inserting open call ${openCall.title}:`, error)
      } else if (data && data.length > 0) {
        openCallIds.push(data[0].id)
      }
    }

    // Sample collections
    const collections = [
      {
        user_id: "sample-artist-1",
        name: "Inspirations",
        description: "A collection of artworks that inspire my creative process.",
        is_public: true,
      },
      {
        user_id: "sample-artist-2",
        name: "Environmental Art",
        description: "Artworks that address environmental issues and sustainability.",
        is_public: true,
      },
      {
        user_id: "sample-artist-3",
        name: "Digital Explorations",
        description: "A collection of innovative digital artworks.",
        is_public: true,
      },
      {
        user_id: "sample-curator-1",
        name: "Emerging Talents",
        description: "A curated selection of works by promising emerging artists.",
        is_public: true,
      },
    ]

    // Insert sample collections
    const collectionIds = []
    for (const collection of collections) {
      const { data, error } = await supabase.from("collections").upsert(collection).select("id")

      if (error) {
        console.error(`Error inserting collection ${collection.name}:`, error)
      } else if (data && data.length > 0) {
        collectionIds.push(data[0].id)
      }
    }

    // Add artworks to collections
    if (collectionIds.length > 0 && artworkIds.length > 0) {
      const collectionItems = []

      // Add random artworks to each collection
      for (const collectionId of collectionIds) {
        // Add 3-5 random artworks to each collection
        const numItems = Math.floor(Math.random() * 3) + 3
        const shuffledArtworks = [...artworkIds].sort(() => 0.5 - Math.random())

        for (let i = 0; i < Math.min(numItems, shuffledArtworks.length); i++) {
          collectionItems.push({
            collection_id: collectionId,
            artwork_id: shuffledArtworks[i],
          })
        }
      }

      // Insert collection items
      if (collectionItems.length > 0) {
        const { error } = await supabase.from("collection_items").upsert(collectionItems)
        if (error) console.error("Error inserting collection items:", error)
      }
    }

    // Sample comments
    const comments = [
      {
        user_id: "sample-artist-3",
        content: "I love the vibrant colors and the way you've captured the essence of heritage in this piece.",
      },
      {
        user_id: "sample-curator-1",
        content:
          "This work speaks volumes about identity and cultural memory. Would love to include it in my upcoming exhibition.",
      },
      {
        user_id: "sample-gallery-1",
        content: "Stunning composition and technique. Our collectors would be very interested in this.",
      },
      {
        user_id: "sample-artist-2",
        content: "The texture and depth in this piece is remarkable. Great work!",
      },
      {
        user_id: "sample-artist-1",
        content:
          "I appreciate how you've incorporated traditional elements with a contemporary approach. Very inspiring.",
      },
    ]

    // Insert sample comments for each artwork
    for (const artworkId of artworkIds) {
      // Add 2-3 random comments to each artwork
      const numComments = Math.floor(Math.random() * 2) + 2
      for (let i = 0; i < numComments; i++) {
        const comment = comments[Math.floor(Math.random() * comments.length)]
        const { error } = await supabase.from("comments").insert({
          user_id: comment.user_id,
          artwork_id: artworkId,
          content: comment.content,
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random date within the last week
        })
        if (error) console.error(`Error inserting comment:`, error)
      }

      // Add random likes to each artwork
      for (const artist of artists) {
        // 50% chance of liking
        if (Math.random() > 0.5) {
          const { error } = await supabase.from("likes").insert({
            user_id: artist.id,
            artwork_id: artworkId,
          })
          if (error && !error.message.includes("duplicate")) {
            console.error(`Error inserting like:`, error)
          }
        }
      }
    }

    // Sample open call submissions
    if (openCallIds.length > 0 && artworkIds.length > 0) {
      const submissions = []

      // For each open call, add 2-4 submissions
      for (const openCallId of openCallIds) {
        const numSubmissions = Math.floor(Math.random() * 3) + 2
        const shuffledArtists = [artists[0].id, artists[1].id, artists[2].id].sort(() => 0.5 - Math.random())
        const shuffledArtworks = [...artworkIds].sort(() => 0.5 - Math.random())

        for (let i = 0; i < numSubmissions; i++) {
          if (i < shuffledArtists.length && i < shuffledArtworks.length) {
            submissions.push({
              open_call_id: openCallId,
              user_id: shuffledArtists[i],
              artwork_id: shuffledArtworks[i],
              statement: "This work explores themes relevant to the open call through my unique artistic perspective.",
              status: ["pending", "accepted", "rejected"][Math.floor(Math.random() * 3)],
            })
          }
        }
      }

      // Insert submissions
      for (const submission of submissions) {
        const { error } = await supabase.from("open_call_submissions").insert(submission)
        if (error && !error.message.includes("duplicate")) {
          console.error("Error inserting submission:", error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Sample data seeded successfully",
      data: {
        artists: artists.length,
        artworks: artworks.length,
        openCalls: openCalls.length,
        collections: collections.length,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
