"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, MapPin, Globe, Instagram, Twitter } from "lucide-react"
import { EditProfileDialog } from "./edit-profile-dialog"

interface ProfileHeaderProps {
  profile: any
  isCurrentUser: boolean
}

export function ProfileHeader({ profile, isCurrentUser }: ProfileHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Parse social links from JSON
  const socialLinks = profile.social_links || {}

  return (
    <div className="mb-8">
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-gradient-to-r from-purple-500 to-pink-500">
        {/* Cover image would go here */}
      </div>

      <div className="relative -mt-16 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end">
            {/* Profile Avatar */}
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.name} />
              <AvatarFallback className="text-4xl">{profile.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="ml-4 pb-4">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-muted-foreground">{profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</p>
            </div>
          </div>

          <div className="mt-4 flex sm:mt-0">
            {isCurrentUser ? (
              <Button variant="outline" onClick={() => setIsEditDialogOpen(true)} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <Button className="flex items-center gap-2">Follow</Button>
            )}
          </div>
        </div>

        {/* Bio and Details */}
        <div className="mt-6 grid gap-4">
          {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>
            )}

            {profile.website && (
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <a
                  href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary hover:underline"
                >
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}

            {socialLinks.instagram && (
              <div className="flex items-center gap-1">
                <Instagram className="h-4 w-4" />
                <a
                  href={`https://instagram.com/${socialLinks.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary hover:underline"
                >
                  @{socialLinks.instagram}
                </a>
              </div>
            )}

            {socialLinks.twitter && (
              <div className="flex items-center gap-1">
                <Twitter className="h-4 w-4" />
                <a
                  href={`https://twitter.com/${socialLinks.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary hover:underline"
                >
                  @{socialLinks.twitter}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {isCurrentUser && (
        <EditProfileDialog profile={profile} isOpen={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} />
      )}
    </div>
  )
}
