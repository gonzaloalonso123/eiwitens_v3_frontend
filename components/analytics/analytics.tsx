"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClicksOverTime } from "./clicks-over-time"
import { ProductPerformance } from "./product-performance"
import { StoreAnalytics } from "./store-analytics"
import { AnalyticsSummary } from "./analytics-summary"

export function Analytics() {
  const [activeTab, setActiveTab] = useState("summary")

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-3xl">
          <TabsTrigger value="summary" data-value="summary">
            Summary
          </TabsTrigger>
          <TabsTrigger value="clicks" data-value="clicks">
            Clicks Over Time
          </TabsTrigger>
          <TabsTrigger value="products" data-value="products">
            Product Performance
          </TabsTrigger>
          <TabsTrigger value="stores" data-value="stores">
            Store Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          <AnalyticsSummary />
        </TabsContent>

        <TabsContent value="clicks" className="mt-6">
          <ClicksOverTime />
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <ProductPerformance />
        </TabsContent>

        <TabsContent value="stores" className="mt-6">
          <StoreAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}

