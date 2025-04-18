import { ForgotPasswordForm } from "@/components/forgot-password-form"
import { Palette } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <Link href="/" className="flex items-center gap-2 mb-8 text-xl font-bold">
          <Palette className="h-6 w-6" />
          <span>ArtHub</span>
        </Link>
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Reset your password</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Enter your email and we&apos;ll send you a link to reset your password
            </p>
          </div>
          <ForgotPasswordForm />
          <div className="text-center text-sm">
            Remember your password?{" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
