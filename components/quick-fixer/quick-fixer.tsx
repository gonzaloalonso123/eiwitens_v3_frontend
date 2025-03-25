"use client";

import { useEffect, useState } from "react";
import { getProducts, updateProduct } from "@/lib/product-service";
import { ScraperActions } from "@/components/products/scraper-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Copy,
  ExternalLink,
  Save,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Sparkle,
  Loader,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Product, ScraperAction } from "@/lib/product-service";
import { testScraper, testScraperAi } from "@/lib/api-service";

export function QuickFixer() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [storedActions, setStoredActions] = useState<ScraperAction[][]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await getProducts();
        const toFixProducts = allProducts.filter(
          (product) => product.enabled && product.warning
        );
        const initialStoredActions = toFixProducts.map(
          (product) => product.scraper || []
        );
        setStoredActions(initialStoredActions);
        setProducts(toFixProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to fetch products that need fixing",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  const setStoredByIndex = (index: number, actions: ScraperAction[]) => {
    setStoredActions((prev) => {
      const newActions = [...prev];
      newActions[index] = actions;
      return newActions;
    });
  };

  const save = async () => {
    if (products.length === 0 || !storedActions[currentIndex]?.length) return;

    try {
      const productId = products[currentIndex].id;
      if (!productId) {
        throw new Error("Product ID is missing");
      }

      await updateProduct(productId, {
        scraper: storedActions[currentIndex],
        warning: false,
      });

      toast({
        title: "Success",
        description: "Product fixed successfully",
      });
      setProducts((prev) => prev.filter((_, index) => index !== currentIndex));
      if (currentIndex >= products.length - 1) {
        setCurrentIndex(Math.max(0, products.length - 2));
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product changes",
        variant: "destructive",
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = async () => {
    await save();
    if (currentIndex < products.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="h-8 w-8" />
        <span className="ml-2">Loading products that need fixing...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return <NothingToFix />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Counter currentIndex={currentIndex + 1} total={products.length} />
      </div>

      <FixCard
        key={`product-${currentIndex}`}
        product={products[currentIndex]}
        setStoredActions={(actions) => setStoredByIndex(currentIndex, actions)}
        storedActions={storedActions[currentIndex] || []}
      />

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <Button onClick={handleNext}>
          {currentIndex === products.length - 1 ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save and Finish
            </>
          ) : (
            <>
              Save and Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function Counter({
  currentIndex,
  total,
}: {
  currentIndex: number;
  total: number;
}) {
  return (
    <div className="bg-[#f97316] text-white font-medium px-3 py-1.5 rounded-md inline-flex items-center">
      {currentIndex} / {total}
    </div>
  );
}

function NothingToFix() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-green-100 p-3 mb-4">
            <ThumbsUp className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Nothing to Fix</h2>
          <p className="text-muted-foreground">
            All products are working correctly. There are no products with
            warning flags.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function FixCard({
  product,
  setStoredActions,
  storedActions,
}: {
  product: Product;
  setStoredActions: (actions: ScraperAction[]) => void;
  storedActions: ScraperAction[];
}) {
  const { toast } = useToast();
  const [temporaryAiActions, setTemporaryAiActions] = useState<{
    generatedActions: ScraperAction[];
    price: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setTemporaryAiActions(null);
  }, [product.id]);

  const copyUrl = () => {
    navigator.clipboard.writeText(product.url);
    toast({
      title: "URL Copied",
      description: "Product URL has been copied to clipboard",
    });
  };

  const handleTryWithAI = async () => {
    try {
      setLoading(true);
      const response = await testScraperAi(
        product.url,
        product.cookieBannerXPaths
      );
      setTemporaryAiActions(response);
    } catch (error) {
      console.error("Error testing with AI:", error);
      toast({
        title: "Error",
        description: "Failed to test with AI",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestScraper = async () => {
    try {
      return await testScraper(
        product.url,
        storedActions,
        product.cookieBannerXPaths
      );
    } catch (error) {
      console.error("Error testing scraper:", error);
      toast({
        title: "Error",
        description: "Failed to test scraper",
        variant: "destructive",
      });
      return null;
    }
  };

  const applyAiActions = () => {
    if (temporaryAiActions?.generatedActions) {
      setStoredActions(temporaryAiActions.generatedActions);
      toast({
        title: "AI Actions Applied",
        description: "AI-detected actions have been applied",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{product.name}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyUrl}>
              <Copy className="mr-2 h-4 w-4" />
              <span className="max-w-[200px] truncate hidden sm:inline">
                {product.url}
              </span>
              <span className="sm:hidden">Copy URL</span>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href={product.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              onClick={handleTryWithAI}
              disabled={loading}
            >
              {loading ? "Processing" : "Try with AI"}
              {loading ? (
                <Loader className="ml-2 animate-spin h-4 w-4" />
              ) : (
                <Sparkle className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Store</p>
              <p className="text-sm text-muted-foreground">{product.store}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Type</p>
              <p className="text-sm text-muted-foreground">{product.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Price</p>
              <p className="text-sm text-muted-foreground">
                €{product.price || "0.00"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Amount</p>
              <p className="text-sm text-muted-foreground">{product.ammount}</p>
            </div>
          </div>

          {temporaryAiActions && (
            <div className="bg-green-100 p-4 rounded-md">
              <p className="text-sm font-medium mb-2">AI Detected Actions</p>
              {temporaryAiActions.generatedActions?.map((action, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground p-1 rounded-md border">
                    {action.selector} :
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {action.xpath}
                  </span>
                </div>
              ))}
              <p className="text-sm font-medium mt-2">AI Detected Price</p>
              <p className="text-sm text-muted-foreground">
                €{temporaryAiActions.price}
              </p>

              <Button className="mx-auto mt-4 block" onClick={applyAiActions}>
                Use AI Actions
              </Button>
            </div>
          )}

          <div className="pt-4">
            <p className="text-sm font-medium mb-4">Scraper Actions</p>
            <ScraperActions
              value={storedActions}
              onChange={setStoredActions}
              url={product.url}
              onTest={handleTestScraper}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
