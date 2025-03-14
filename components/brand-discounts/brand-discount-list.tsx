"use client";

import { useEffect, useState } from "react";
import {
  getBrandDiscounts,
  removeDiscountFromAllProductsOfStore,
} from "@/lib/product-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { BrandDiscount } from "@/lib/product-service";

export function BrandDiscountList() {
  const [discounts, setDiscounts] = useState<BrandDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const data = await getBrandDiscounts();
      setDiscounts(data);
    } catch (error) {
      console.error("Error fetching brand discounts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch brand discounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleRemoveDiscount = async (brand: string) => {
    try {
      await removeDiscountFromAllProductsOfStore(brand);
      toast({
        title: "Success",
        description: `Discount for ${brand} removed successfully`,
      });
      fetchDiscounts();
    } catch (error) {
      console.error("Error removing discount:", error);
      toast({
        title: "Error",
        description: "Failed to remove discount",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner className="h-6 w-6 mr-2" />
        <span>Loading discounts...</span>
      </div>
    );
  }

  if (discounts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No active discounts found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {discounts.map((discount) => (
        <DiscountItem
          key={discount.id}
          discount={discount}
          onRemove={handleRemoveDiscount}
        />
      ))}
    </div>
  );
}

function DiscountItem({
  discount,
  onRemove,
}: {
  discount: BrandDiscount;
  onRemove: (brand: string) => void;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{discount.id}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Discount Type</p>
                <p className="font-medium">{discount.discount_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Discount Code</p>
                <p className="font-medium">{discount.discount_code || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Discount Value</p>
                <p className="font-medium">{discount.discount_value || "—"}</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onRemove(discount.id!)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
