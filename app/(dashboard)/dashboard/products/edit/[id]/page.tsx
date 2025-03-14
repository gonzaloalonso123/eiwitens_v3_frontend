"use client";

import { useEffect, useState } from "react";
import { ProductForm } from "@/components/products/product-form";
import { getProductById, type Product } from "@/lib/product-service";
import { useParams } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (typeof id !== "string") {
          throw new Error("Invalid product ID");
        }

        const data = await getProductById(id);
        if (!data) {
          throw new Error("Product not found");
        }

        setProduct(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch product"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <ProductForm initialData={product} isEditing={true} />
    </div>
  );
}
