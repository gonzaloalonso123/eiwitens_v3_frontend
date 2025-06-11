"use client";

import { useEffect, useState } from "react";
import {
  getProducts,
  updateProduct,
  type Product,
} from "@/lib/product-service";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function ProvisionalPriceList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      const productsWithProvisionalPrice = data.filter(
        (product) => product.provisional_price !== null
      );
      setProducts(productsWithProvisionalPrice);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (product: Product) => {
    if (!product.id || product.provisional_price === null) return;

    try {
      await updateProduct(product.id, {
        price: product.provisional_price,
        provisional_price: null,
      });

      setProducts((prevProducts) =>
        prevProducts.filter((p) => p.id !== product.id)
      );

      toast({
        title: "Success",
        description: "Price verified successfully",
      });
    } catch (error) {
      console.error("Error verifying price:", error);
      toast({
        title: "Error",
        description: "Failed to verify price",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Provisional Prices</h2>
        <span className="text-sm text-muted-foreground">
          {products.length} products to verify
        </span>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Current Price</TableHead>
              <TableHead>New Price</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No products with provisional prices
                </TableCell>
              </TableRow>
            ) : (
              products
                .filter((product) => product.provisional_price)
                .map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.store}</TableCell>
                    <TableCell>€{product?.price || 0}</TableCell>
                    <TableCell>€{product.provisional_price}</TableCell>
                    <TableCell>
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Product
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => handleVerify(product)}
                        variant="outline"
                      >
                        Verify Price
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
