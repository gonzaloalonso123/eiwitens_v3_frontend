"use client"

import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/sidebar"
import { ProductList } from "@/components/product-list"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { ThemeScript } from "./theme-script"

export function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <>
      <ThemeScript />
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-[#00bcd4] overflow-auto">
          <div className="p-4 min-h-full">
            <div className="mx-auto rounded-lg bg-white p-4 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Logged in as: <span className="font-medium">{user}</span>
                </div>
                <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
              <ProductList />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

