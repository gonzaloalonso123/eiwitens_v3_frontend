import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { UserInfo } from "@/components/user-info";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-[#00bcd4] overflow-auto">
          <div className="p-4 min-h-full">
            <div className="mx-auto rounded-lg bg-white p-4 shadow-md">
              <UserInfo />
              {children}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
