"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChartComponent } from "./chart-components";
import {
  getStoreAnalyticsData,
  type PieChartData,
} from "@/lib/analytics-service";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function StoreAnalytics() {
  const [storeClicks, setStoreClicks] = useState<PieChartData[]>([]);
  const [storeProducts, setStoreProducts] = useState<PieChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { storeClicks, storeProducts } = await getStoreAnalyticsData();
        setStoreClicks(storeClicks);
        setStoreProducts(storeProducts);
      } catch (error) {
        console.error("Error fetching store analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="clicks">
        <TabsList>
          <TabsTrigger value="clicks">Clicks by Store</TabsTrigger>
          <TabsTrigger value="products">Products by Store</TabsTrigger>
        </TabsList>

        <TabsContent value="clicks" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PieChartComponent
              data={storeClicks}
              title="Click Distribution by Store"
              description="Percentage of total clicks by store"
            />

            <Card>
              <CardHeader>
                <CardTitle>Store Click Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  This chart shows the distribution of clicks across different
                  stores. Use this data to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Identify which stores are generating the most engagement
                  </li>
                  <li>Compare store performance</li>
                  <li>
                    Discover opportunities to promote products from
                    underperforming stores
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Consider featuring products from high-performing stores more
                  prominently, or running special promotions for stores with
                  lower engagement.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PieChartComponent
              data={storeProducts}
              title="Product Distribution by Store"
              description="Percentage of total products by store"
            />

            <Card>
              <CardHeader>
                <CardTitle>Store Product Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  This chart shows the distribution of products across different
                  stores. Use this data to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Understand your product catalog composition</li>
                  <li>Identify stores with limited product representation</li>
                  <li>Plan product expansion strategies</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Compare this chart with the clicks distribution to identify
                  stores that have a high click-to-product ratio (efficient) or
                  a low click-to-product ratio (opportunity for improvement).
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Store Performance Comparison</CardTitle>
          <CardDescription>
            Analyze how different stores contribute to your overall performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Understanding store performance helps you make strategic decisions
            about which partnerships to prioritize and where to focus your
            marketing efforts. Look for these patterns:
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium text-green-800 mb-1">
                High Performers
              </h3>
              <p className="text-sm text-green-700">
                Stores with a high percentage of clicks relative to their
                product count are your most efficient partners. Consider
                expanding your product range with these stores.
              </p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
              <h3 className="font-medium text-amber-800 mb-1">
                Underperformers
              </h3>
              <p className="text-sm text-amber-700">
                Stores with many products but few clicks may need better
                promotion or more competitive pricing. Review these products to
                identify improvement opportunities.
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-medium text-blue-800 mb-1">
                Growth Opportunities
              </h3>
              <p className="text-sm text-blue-700">
                Stores with few products but good click performance show
                potential for expansion. Consider adding more products from
                these stores to your catalog.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
