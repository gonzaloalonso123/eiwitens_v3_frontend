"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip during initial loading
    if (loading) return

    // If not authenticated and not on auth pages, redirect to login
    if (!user && !pathname.includes("/login") && !pathname.includes("/register")) {
      router.push("/login")
    }

    // If authenticated and on auth pages, redirect to dashboard
    if (user && (pathname.includes("/login") || pathname.includes("/register"))) {
      router.push("/")
    }
  }, [user, loading, router, pathname])

  // Show loading spinner while loading
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#00bcd4]">
        <div className="rounded-lg bg-white p-8 shadow-md flex gap-2">
          <LoadingSpinner className="h-8 w-8 text-[#00bcd4]" />
          <p className="mt-4 text-center text-sm text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    )
  }

  // On auth pages, render children directly
  if (pathname.includes("/login") || pathname.includes("/register")) {
    return <>{children}</>
  }

  // For protected pages, only render if authenticated
  if (user) {
    return <>{children}</>
  }

  // Default case - show loading while redirecting
  return (
    <div className="flex h-screen items-center justify-center bg-[#00bcd4]">
      <div className="rounded-lg bg-white p-8 shadow-md">
        <LoadingSpinner className="h-8 w-8 text-[#00bcd4]" />
        <p className="mt-4 text-center text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}

