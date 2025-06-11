"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandDiscountList } from "./brand-discount-list";
import { AddDiscount } from "./add-discount";
import { DeleteBrandDiscount } from "./delete-brand-discount";

export function BrandDiscounts() {
  const [activeTab, setActiveTab] = useState("active");

  return (
    <div>
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="active">Active Discounts</TabsTrigger>
          <TabsTrigger value="new">Add New</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6">
          <BrandDiscountList />
        </TabsContent>
        <TabsContent value="new" className="mt-6">
          <AddDiscount />
        </TabsContent>
      </Tabs>
      <div className="h-20" />
      <DeleteBrandDiscount />
    </div>
  );
}
