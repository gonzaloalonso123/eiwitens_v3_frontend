import Image from "next/image"
import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <div className="relative h-12 w-60">
        <Image
          src="/placeholder.svg?height=60&width=240"
          alt="GierigGroeien.nl"
          fill
          className="object-contain"
          priority
        />
      </div>
    </Link>
  )
}

