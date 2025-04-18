import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

interface EmptyStateProps {
  title: string
  description: string
  buttonText: string
  buttonLink: string
}

export function EmptyState({ title, description, buttonText, buttonLink }: EmptyStateProps) {
  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">{description}</p>
        <Link href={buttonLink}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {buttonText}
          </Button>
        </Link>
      </div>
    </div>
  )
}
