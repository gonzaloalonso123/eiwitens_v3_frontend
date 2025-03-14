"use client";

import { useEffect, useState } from "react";
import {
  getProducts,
  applyDiscountToAllProductsOfStore,
} from "@/lib/product-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { discountTypes } from "@/lib/constants";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Save } from "lucide-react";

const formSchema = z.object({
  discount_type: z.string().min(1, "Discount type is required"),
  discount_code: z.string().optional(),
  discount_value: z.string().min(1, "Discount value is required"),
  brand: z.string().min(1, "Brand is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function AddDiscount() {
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discount_type: "",
      discount_code: "",
      discount_value: "",
      brand: "",
    },
  });

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

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      await applyDiscountToAllProductsOfStore(
        values.brand,
        values.discount_type,
        values.discount_value,
        values.discount_code || ""
      );

      toast({
        title: "Success",
        description: `Discount applied to all ${values.brand} products`,
      });

      form.reset();
    } catch (error) {
      console.error("Error applying discount:", error);
      toast({
        title: "Error",
        description: "Failed to apply discount",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
        <CardTitle>Add Brand Discount</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a brand" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discount_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {discountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discount_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Value</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 10 or 10%" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discount_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Code (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. SUMMER10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Apply Discount
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
