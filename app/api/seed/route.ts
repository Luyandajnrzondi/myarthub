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

    // Create sample conversations
    const conversations = [
      {
        participants: ["sample-artist-1", "sample-curator-1"],
        messages: [
          {
            user_id: "sample-curator-1",
            content:
              "Hi Thandi, I really love your recent work 'Echoes of Ancestry'. Would you be interested in exhibiting it in our upcoming show?",
          },
          {
            user_id: "sample-artist-1",
            content: "Thank you, Mandla! I'd be very interested. When is the exhibition planned for?",
          },
          {
            user_id: "sample-curator-1",
            content:
              "We're looking at opening in three months. It will be a group show focusing on contemporary African identity. Your work would be perfect.",
          },
        ],
      },
      {
        participants: ["sample-artist-2", "sample-gallery-1"],
        messages: [
          {
            user_id: "sample-gallery-1",
            content:
              "Hello Sipho, Ubuntu Gallery would like to represent your sculpture series. Are you currently working with any other galleries?",
          },
          {
            user_id: "sample-artist-2",
            content:
              "Hi Ubuntu Gallery, thanks for reaching out! I'm not exclusively represented at the moment. I'd be interested in discussing this further.",
          },
          {
            user_id: "sample-gallery-1",
            content: "Great! Could we schedule a meeting next week to discuss terms and see more of your work?",
          },
        ],
      },
    ]

    // Insert sample conversations and messages
    for (const conversation of conversations) {
      // Create conversation
      const { data: convData, error: convError } = await supabase.from("conversations").insert({}).select("id")

      if (convError) {
        console.error(`Error creating conversation:`, convError)
        continue
      }

      const conversationId = convData[0].id

      // Add participants
      for (const participantId of conversation.participants) {
        const { error: partError } = await supabase.from("conversation_participants").insert({
          conversation_id: conversationId,
          user_id: participantId,
        })
        if (partError) console.error(`Error adding participant:`, partError)
      }

      // Add messages
      for (const message of conversation.messages) {
        const { error: msgError } = await supabase.from("messages").insert({
          conversation_id: conversationId,
          user_id: message.user_id,
          content: message.content,
          read: Math.random() > 0.5, // Random read status
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random date within the last week
        })
        if (msgError) console.error(`Error adding message:`, msgError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Sample data seeded successfully",
      data: {
        artists: artists.length,
        artworks: artworks.length,
        conversations: conversations.length,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
