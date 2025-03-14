"use client";

import type React from "react";

import {
  Package2,
  Settings,
  FileText,
  PlusCircle,
  Zap,
  Tag,
  BarChart3,
  Home,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import Logo from "@/images/rogier.webp";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { StatusIndicator } from "@/components/status-indicator";
import Image from "next/image";
import { Avatar } from "./ui/avatar";

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-[300px] flex-col border-r bg-white overflow-hidden">
      <Image
        src={Logo}
        alt="Rogier"
        width={80}
        height={80}
        className="mx-auto"
      />
      <div className="flex-1 overflow-auto px-4 py-2">
        <nav className="space-y-1">
          <NavItem
            icon={<Home className="h-5 w-5" />}
            label="Dashboard"
            href="/dashboard"
            active={pathname === "/dashboard"}
          />
          <NavItem
            icon={<Package2 className="h-5 w-5" />}
            label="Products"
            href="/dashboard/products"
            active={
              pathname.startsWith("/dashboard/products") &&
              !pathname.includes("/create")
            }
          />
          <NavItem
            icon={<Settings className="h-5 w-5" />}
            label="Manage"
            href="/dashboard/manage"
            active={pathname === "/dashboard/manage"}
          />
          <NavItem
            icon={<FileText className="h-5 w-5" />}
            label="Docs"
            href="/dashboard/docs"
            active={pathname === "/dashboard/docs"}
          />
          <NavItem
            icon={<PlusCircle className="h-5 w-5" />}
            label="Create Product"
            href="/dashboard/products/create"
            active={pathname === "/dashboard/products/create"}
          />
          <NavItem
            icon={<Zap className="h-5 w-5" />}
            label="Quick Fixer"
            href="/dashboard/quick-fixer"
            active={pathname === "/dashboard/quick-fixer"}
          />
          <NavItem
            icon={<Tag className="h-5 w-5" />}
            label="Brand discounts"
            href="/dashboard/brand-discounts"
            active={pathname === "/dashboard/brand-discounts"}
          />
          <NavItem
            icon={<BarChart3 className="h-5 w-5" />}
            label="General Analytics"
            href="/dashboard/analytics"
            active={pathname === "/dashboard/analytics"}
          />
        </nav>
      </div>

      <div className="border-t p-4 bg-white">
        <div className="text-sm text-muted-foreground">
          {user || "Not logged in"}
        </div>
        <div className="mt-2 flex justify-between items-center">
          <div className="text-sm font-medium">Status</div>
          <StatusIndicator />
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

function NavItem({ icon, label, href, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
        active
          ? "bg-[#e6f7f9] text-[#00bcd4]"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
