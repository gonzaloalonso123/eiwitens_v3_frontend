"use client";

import { useStatus } from "@/hooks/use-status";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function StatusIndicator() {
  const { status, loading } = useStatus();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status</span>
            <div
              className={`w-3 h-3 rounded-full ${
                loading
                  ? "bg-amber-500"
                  : status
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {loading
              ? "Checking backend connection..."
              : status
              ? "Backend connected"
              : "Backend disconnected"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
