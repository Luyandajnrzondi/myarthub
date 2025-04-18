import { ResetPasswordForm } from "@/components/reset-password-form"
import { Palette } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <Link href="/" className="flex items-center gap-2 mb-8 text-xl font-bold">
          <Palette className="h-6 w-6" />
          <span>ArtHub</span>
        </Link>
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Create new password</h1>
            <p className="text-gray-500 dark:text-gray-400">Enter a new password for your account</p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
