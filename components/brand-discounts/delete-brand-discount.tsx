"use client";

import { useState, useEffect } from "react";
import { getProducts, removeDiscountFromAllProductsOfStore } from "@/lib/product-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertCircle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteBrandDiscount() {
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const products = await getProducts();
        const brandSet = new Set<string>();

        products.forEach((product) => {
          if (product.store) {
            brandSet.add(product.store);
          }
        });

        setBrands(Array.from(brandSet).sort());
      } catch (error) {
        console.error("Error fetching brands:", error);
        toast({
          title: "Error",
          description: "Failed to fetch brands",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [toast]);

  const handleDeleteDiscounts = async () => {
    if (!selectedBrand) return;

    try {
      setDeleting(true);
      await removeDiscountFromAllProductsOfStore(selectedBrand);

      toast({
        title: "Success",
        description: `All discounts for ${selectedBrand} have been removed`,
      });

      setSelectedBrand("");
    } catch (error) {
      console.error("Error removing discounts:", error);
      toast({
        title: "Error",
        description: "Failed to remove discounts",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner className="h-6 w-6 mr-2" />
        <span>Loading brands...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete Brand Discounts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="brand-select" className="text-sm font-medium">
              Select Brand
            </label>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger id="brand-select" className="w-full">
                <SelectValue placeholder="Select a brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={!selectedBrand || deleting}>
                {deleting ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Removing Discounts...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete All Discounts
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Confirm Deletion
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all discounts for <strong>{selectedBrand}</strong> products. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteDiscounts}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
