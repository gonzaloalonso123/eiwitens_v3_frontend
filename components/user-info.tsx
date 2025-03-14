"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function UserInfo() {
  const { user, logout } = useAuth();

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Logged in as: <span className="font-medium">{user}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={logout}
        className="flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}
