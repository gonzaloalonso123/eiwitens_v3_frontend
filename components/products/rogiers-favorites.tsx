"use client";

import { useEffect, useState } from "react";
import {
  getProducts,
  getRogiersFavorites,
  replaceRogiersFavorites,
  type Product,
} from "@/lib/product-service";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import rogierImage from "@/images/rogier.webp";

export function RogiersFavorites() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerms, setSearchTerms] = useState<string[]>(["", ""]);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, favorites] = await Promise.all([
        getProducts(),
        getRogiersFavorites(),
      ]);
      setProducts(productsData);
      setSelectedFavorites(favorites);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (selectedFavorites.length !== 2) {
      toast({
        title: "Error",
        description: "Please select exactly two products",
        variant: "destructive",
      });
      return;
    }

    try {
      await replaceRogiersFavorites(selectedFavorites);
      toast({
        title: "Success",
        description: "Rogier's favorites updated successfully",
      });
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  const handleSelectProduct = (productId: string, index: number) => {
    setSelectedFavorites((prev) => {
      const newFavorites = [...prev];
      newFavorites[index] = productId;
      return newFavorites;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  const getFilteredProducts = (index: number) => {
    return products.filter((product) => {
      const searchTerm = searchTerms[index].toLowerCase();
      return (
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm) ||
        product.store.toLowerCase().includes(searchTerm)
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="font-medium mb-2">
          To create Rogier's favorites, follow these steps:
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            Upload the product image to Hostinger with filename:
            <span className="font-mono text-sm ml-2">
              rogiers-choice-[product-image-name]
            </span>
          </li>
          <li>
            Upload the mobile version to Hostinger with filename:
            <span className="font-mono text-sm ml-2">
              mobile-rogiers-choice-[product-image-name]
            </span>
            <span className="block text-sm text-gray-600 mt-1">
              (with necessary mobile adjustments)
            </span>
          </li>
          <li>Add the product in the dashboard selecting it below</li>
        </ol>
      </div>
      <div className="flex gap-6">
        <Image src={rogierImage} width={200} height={200} alt="rogier" />
        <div className="space-y-4">
          <div className="grid gap-4 max-w-xl">
            {[0, 1].map((index) => (
              <div key={index} className="space-y-2">
                <label className="text-sm font-medium">
                  Favorite Product {index + 1}
                </label>
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerms[index]}
                  onChange={(e) => {
                    const newSearchTerms = [...searchTerms];
                    newSearchTerms[index] = e.target.value;
                    setSearchTerms(newSearchTerms);
                  }}
                  className="mb-2"
                />
                <Select
                  value={selectedFavorites[index] || ""}
                  onValueChange={(value) => handleSelectProduct(value, index)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredProducts(index).map((product) => (
                      <SelectItem
                        key={product.id}
                        value={product.id || ""}
                        disabled={
                          !product.id ||
                          (selectedFavorites.includes(product.id) &&
                            selectedFavorites[index] !== product.id)
                        }
                      >
                        {product.name} - {product.store}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSave}
            disabled={selectedFavorites.length !== 2}
          >
            Save Favorites
          </Button>
        </div>
      </div>
    </div>
  );
}
