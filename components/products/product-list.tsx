"use client";

import { useEffect, useState } from "react";
import {
  getProducts,
  type Product,
  deleteProduct,
} from "@/lib/product-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  Plus,
  Search,
  Trash2,
  Edit,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function ProductList() {
  const [searchTerm, setSearchTerm] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("productSearchTerm") || "";
    }
    return "";
  });
  const [storeFilter, setStoreFilter] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("productStoreFilter");
      return stored !== null ? stored : null;
    }
    return null;
  });
  const [typeFilter, setTypeFilter] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("productTypeFilter");
      return stored !== null ? stored : null;
    }
    return null;
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("productSearchTerm", searchTerm);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (storeFilter) {
        localStorage.setItem("productStoreFilter", storeFilter);
      } else {
        localStorage.removeItem("productStoreFilter");
      }
    }
  }, [storeFilter]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (typeFilter) {
        localStorage.setItem("productTypeFilter", typeFilter);
      } else {
        localStorage.removeItem("productTypeFilter");
      }
    }
  }, [typeFilter]);

  useEffect(() => {
    console.log("Loaded filters:", {
      searchTerm,
      storeFilter,
      typeFilter,
    });
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
      console.log(
        data
          .slice(0, 5)
          .map((product) => ({
            ...product,
            count_clicked: undefined,
            price_history: undefined,
          }))
      );
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

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter((product) => product.id !== id));
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const getUniqueStores = () => {
    const stores = new Set<string>();
    products.forEach((product) => {
      if (product.store) {
        stores.add(product.store);
      }
    });
    return Array.from(stores);
  };

  const getUniqueTypes = () => {
    const types = new Set<string>();
    products.forEach((product) => {
      if (product.type) {
        types.add(product.type);
      }
    });
    return Array.from(types);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.store.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore =
      !storeFilter ||
      product.store.toLowerCase().includes(storeFilter.toLowerCase());
    const matchesType = !typeFilter || product.type === typeFilter;

    return matchesSearch && matchesStore && matchesType;
  });

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
        <Link href="/dashboard/products/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative max-w-[150px]">
          <Input
            placeholder="Store filter"
            value={storeFilter || ""}
            onChange={(e) => setStoreFilter(e.target.value || null)}
            className="w-full"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[150px] justify-between">
              <span>{typeFilter || "All Types"}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setTypeFilter(null)}>
              All Types
            </DropdownMenuItem>
            {getUniqueTypes().map((type) => (
              <DropdownMenuItem key={type} onClick={() => setTypeFilter(type)}>
                {type}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredProducts.length} / {products.length}
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Warning</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.store}</TableCell>
                  <TableCell>{product.type}</TableCell>
                  <TableCell>
                    €
                    {typeof product.price === "number"
                      ? product.price.toFixed(2)
                      : "0.00"}
                  </TableCell>
                  <TableCell>
                    {product.warning ? (
                      <span className="w-full flex items-center justify-center">
                        <TriangleAlert className="h-6 w-6 text-red-500" />
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        product.enabled
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.enabled ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/products/edit/${product.id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this product?"
                            )
                          ) {
                            handleDelete(product.id!);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
