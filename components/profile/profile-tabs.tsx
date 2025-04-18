"use client"

import { useState } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { ArtworkGrid } from "@/components/artwork/artwork-grid"

interface ProfileTabsProps {
  profile: any
  artworks: any[]
  isCurrentUser: boolean
}

export function ProfileTabs({ profile, artworks, isCurrentUser }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("gallery")

  return (
    <Tabs defaultValue="gallery" onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>

        {isCurrentUser && activeTab === "gallery" && (
          <Link href="/upload">
            <Button size="sm" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Upload Artwork
            </Button>
          </Link>
        )}
      </div>

      <TabsContent value="gallery" className="mt-6">
        {artworks.length > 0 ? (
          <ArtworkGrid artworks={artworks} />
        ) : (
          <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed">
            <h3 className="text-lg font-medium">No artworks yet</h3>
            <p className="text-sm text-muted-foreground">
              {isCurrentUser
                ? "Upload your first artwork to showcase your talent."
                : `${profile.name} hasn't uploaded any artworks yet.`}
            </p>

            {isCurrentUser && (
              <Link href="/upload" className="mt-4">
                <Button size="sm" className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Upload Artwork
                </Button>
              </Link>
            )}
          </div>
        )}
      </TabsContent>

      <TabsContent value="about" className="mt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">About {profile.name}</h3>

          {profile.bio ? (
            <p className="text-muted-foreground">{profile.bio}</p>
          ) : (
            <p className="text-muted-foreground">
              {isCurrentUser ? "Add a bio to tell others about yourself." : `${profile.name} hasn't added a bio yet.`}
            </p>
          )}

          {isCurrentUser && !profile.bio && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => document.getElementById("edit-profile-button")?.click()}
            >
              Add Bio
            </Button>
          )}
        </div>
      </TabsContent>

      <TabsContent value="collections" className="mt-6">
        <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed">
          <h3 className="text-lg font-medium">Collections Coming Soon</h3>
          <p className="text-sm text-muted-foreground">This feature is under development.</p>
        </div>
      </TabsContent>
    </Tabs>
  )
}
