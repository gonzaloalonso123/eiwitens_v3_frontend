"use client";

import { useState, useEffect } from "react";
import { getStatus } from "@/lib/api-service";

export function useStatus() {
  const [status, setStatus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        const result = await getStatus();
        setStatus(result);
      } catch (error) {
        console.error("Error checking status:", error);
        setStatus(false);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();

    // Optional: Set up polling to periodically check status
    const interval = setInterval(checkStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return { status, loading };
}
