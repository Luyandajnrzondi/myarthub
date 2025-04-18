import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About ArtHub</h1>

        <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
          <p className="lead">
            ArtHub is a web-based platform that helps visual artists, curators, and galleries connect through a social
            inventory system.
          </p>

          <p>
            Our mission is to create a vibrant online community where artists can showcase their work, build their
            professional profiles, and connect with opportunities in the art world. We focus on promoting networking
            opportunities through open calls, community interaction, and personalized art discovery.
          </p>

          <h2>Our Vision</h2>

          <p>
            We believe that art should be accessible to everyone, and that artists deserve a platform that helps them
            gain visibility and connect with their audience. ArtHub aims to bridge the gap between artists, curators,
            galleries, and art enthusiasts, creating a thriving ecosystem for the art community.
          </p>

          <h2>Key Features</h2>

          <ul>
            <li>
              <strong>Artist Profiles:</strong> Create a professional online presence to showcase your work and connect
              with others.
            </li>
            <li>
              <strong>Artwork Showcase:</strong> Upload and display your artwork with detailed information about medium,
              dimensions, and availability.
            </li>
            <li>
              <strong>Open Calls:</strong> Discover exhibition opportunities and submit your work directly through the
              platform.
            </li>
            <li>
              <strong>Community Interaction:</strong> Follow artists, like and comment on artwork, and build your
              network.
            </li>
            <li>
              <strong>Personalized Discovery:</strong> Explore artwork based on your interests and preferences.
            </li>
          </ul>

          <h2>Join Our Community</h2>

          <p>
            Whether you're an artist looking to showcase your work, a curator seeking new talent, or a gallery wanting
            to expand your reach, ArtHub provides the tools and community to help you succeed.
          </p>

          <div className="not-prose mt-8">
            <Link href="/signup">
              <Button size="lg">Join ArtHub Today</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
