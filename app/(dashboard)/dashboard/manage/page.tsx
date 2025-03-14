"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { scrapeAll } from "@/lib/api-service";
import Image from "next/image";
import rogierImage from "@/images/rogier.webp";

export default function ManagePage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleScrape = async () => {
    setLoading(true);
    try {
      await scrapeAll();
      toast({
        title: "Success",
        description: "Scraped and pushed to Wordpress",
      });
    } catch (error) {
      console.error("Error scraping products:", error);
      toast({
        title: "Error",
        description: "Failed to scrape products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage</h1>

      <Card className="bg-gray-100">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-20 h-20 overflow-hidden rounded-full bg-white">
              <Image
                src={rogierImage}
                alt="Rogier"
                width={80}
                height={80}
                className="object-cover"
              />
            </div>

            <div className="flex flex-col gap-4 flex-grow">
              <div className="p-4 bg-white rounded-md shadow-md text-center sm:text-left">
                <h2 className="text-xl font-medium">
                  {loading
                    ? "Yes, Sir!"
                    : "Welcome back my Lord. What do you command?"}
                </h2>
              </div>

              <Button
                onClick={handleScrape}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Scraping products...
                  </>
                ) : (
                  "Scrape all products"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
