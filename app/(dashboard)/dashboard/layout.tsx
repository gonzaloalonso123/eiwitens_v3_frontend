import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { UserInfo } from "@/components/user-info";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex w-full">
        <Sidebar />
        <div className="p-4 bg-primary w-full">
          <div className="mx-auto rounded-lg bg-white p-4 shadow-md w-full">
            {children}
          </div>
        </div>
      </div>
      <Toaster richColors />
    </AuthGuard>
  );
}
