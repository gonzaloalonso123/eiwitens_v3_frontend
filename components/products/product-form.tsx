"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  type Product,
  createProduct,
  updateProduct,
} from "@/lib/product-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import {
  productTypes,
  productSubtypes,
  discountTypes,
  defaultProduct,
} from "@/lib/constants";
import { makeCalculations } from "@/lib/helpers";
import { ScraperActions } from "@/components/products/scraper-actions";
import { Edit, Save, AlertTriangle, Copy } from "lucide-react";
import { useRouter } from "next/navigation";

// Define the schema for the form
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  store: z.string().min(1, "Store name is required"),
  url: z.string().url("Must be a valid URL"),
  ammount: z.string().min(1, "Amount is required"),
  protein_per_100g: z.string().optional(),
  creatine_per_100g: z.string().optional(),
  sugar_per_100g: z.string().optional(),
  calories_per_100g: z.string().optional(),
  caffeine_per_100g: z.string().optional(),
  beta_alanine_per_100g: z.string().optional(),
  citrulline_per_100g: z.string().optional(),
  tyrosine_per_100g: z.string().optional(),
  image: z.string().optional(),
  trustpilot_url: z.string().optional(),
  type: z.string().min(1, "Product type is required"),
  subtypes: z.array(z.string()).default([]),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  discount_type: z.string().default("none"), // Changed from empty string to "none"
  discount_code: z.string().default(""),
  discount_value: z.string().default(""),
  enabled: z.boolean().default(true),
  enabled_top10: z.boolean().default(true),
  scrape_enabled: z.boolean().default(true),
  warning: z.boolean().default(false),
  scraper: z
    .array(
      z.object({
        id: z.string(),
        selector: z.string(),
        xpath: z.string(),
        type: z.string(),
        optionText: z.string().optional(),
      })
    )
    .default([]),
  price_for_element_gram: z.string().optional(),
  price_per_100_calories: z.string().optional(),
  count_clicked: z.array(z.object({ date: z.string() })).default([]),
  trustPilotScore: z.number().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product | null;
  isEditing?: boolean;
}

export function ProductForm({
  initialData,
  isEditing = false,
}: ProductFormProps) {
  const [disabled, setDisabled] = useState(isEditing);
  const [activeTab, setActiveTab] = useState("info");
  const { toast } = useToast();
  const router = useRouter();

  // Initialize the form with default values or initial data
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || (defaultProduct as any),
  });

  // Watch for changes to type and price for calculations
  const watchType = form.watch("type");
  const watchPrice = form.watch("price");

  // Update calculations when price changes
  useEffect(() => {
    if (watchPrice) {
      const values = form.getValues();
      makeCalculations(values as any);
      form.setValue(
        "price_for_element_gram",
        values.price_for_element_gram || ""
      );
      if (values.price_per_100_calories) {
        form.setValue("price_per_100_calories", values.price_per_100_calories);
      }
    }
  }, [watchPrice, form]);

  // Handle form submission
  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (initialData?.id) {
        await updateProduct(initialData.id, data);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await createProduct(data);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
        router.push("/dashboard/products");
      }
      setDisabled(true);
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  // Handle product duplication
  const duplicateProduct = () => {
    if (!initialData) return;

    const { id, ...productData } = initialData;
    const duplicatedProduct = {
      ...productData,
      name: `${productData.name} [DUPLICATE]`,
    };

    // Reset the form with the duplicated data
    form.reset(duplicatedProduct as any);
    setDisabled(false);

    toast({
      title: "Product Duplicated",
      description: "You can now edit and save the duplicated product",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">
            {initialData?.id ? "Edit Product" : "Create Product"}
          </h1>
          {initialData?.warning && (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          )}
        </div>

        {initialData?.id && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDisabled(!disabled)}>
              <Edit className="mr-2 h-4 w-4" />
              {disabled ? "Edit" : "Cancel"}
            </Button>

            <Button variant="outline" onClick={duplicateProduct}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
          </div>
        )}
      </div>

      {initialData?.id && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="info">Information</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <ProductFormContent
              form={form}
              onSubmit={onSubmit}
              disabled={disabled}
              watchType={watchType}
            />
          </TabsContent>

          <TabsContent value="stats">
            <ProductStats product={initialData} />
          </TabsContent>
        </Tabs>
      )}

      {!initialData?.id && (
        <ProductFormContent
          form={form}
          onSubmit={onSubmit}
          disabled={disabled}
          watchType={watchType}
        />
      )}
    </div>
  );
}

function ProductFormContent({
  form,
  onSubmit,
  disabled,
  watchType,
}: {
  form: any;
  onSubmit: (data: ProductFormValues) => void;
  disabled: boolean;
  watchType: string;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input disabled={disabled} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="store"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store</FormLabel>
                  <FormControl>
                    <Input disabled={disabled} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input disabled={disabled} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ammount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (in grams)</FormLabel>
                  <FormControl>
                    <Input disabled={disabled} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Type</FormLabel>
                  <Select
                    disabled={disabled}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productTypes.map((type) => (
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
              name="subtypes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Subtypes</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {productSubtypes[watchType]?.map((subtype) => (
                        <label
                          key={subtype.value}
                          className={`
                            px-3 py-1 rounded-full text-sm cursor-pointer
                            ${
                              field.value?.includes(subtype.value)
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground"
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            value={subtype.value}
                            checked={field.value?.includes(subtype.value)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const value = e.target.value;
                              const currentValues = field.value || [];

                              if (checked) {
                                field.onChange([...currentValues, value]);
                              } else {
                                field.onChange(
                                  currentValues.filter(
                                    (v: string) => v !== value
                                  )
                                );
                              }
                            }}
                            className="sr-only"
                            disabled={disabled}
                          />
                          {subtype.label}
                        </label>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(watchType === "proteine" || watchType === "weight_gainer") && (
              <FormField
                control={form.control}
                name="protein_per_100g"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein per 100g</FormLabel>
                    <FormControl>
                      <Input disabled={disabled} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchType === "creatine" && (
              <FormField
                control={form.control}
                name="creatine_per_100g"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Creatine per 100g</FormLabel>
                    <FormControl>
                      <Input disabled={disabled} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchType === "weight_gainer" && (
              <>
                <FormField
                  control={form.control}
                  name="sugar_per_100g"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sugar per 100g</FormLabel>
                      <FormControl>
                        <Input disabled={disabled} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="calories_per_100g"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories per 100g</FormLabel>
                      <FormControl>
                        <Input disabled={disabled} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {watchType === "preworkout" && (
              <>
                <FormField
                  control={form.control}
                  name="caffeine_per_100g"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caffeine per 100g</FormLabel>
                      <FormControl>
                        <Input disabled={disabled} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="beta_alanine_per_100g"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beta Alanine per 100g</FormLabel>
                      <FormControl>
                        <Input disabled={disabled} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="citrulline_per_100g"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Citrulline per 100g</FormLabel>
                      <FormControl>
                        <Input disabled={disabled} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tyrosine_per_100g"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tyrosine per 100g</FormLabel>
                      <FormControl>
                        <Input disabled={disabled} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      disabled={disabled}
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number.parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Name</FormLabel>
                  <FormControl>
                    <Input disabled={disabled} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trustpilot_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TrustPilot URL</FormLabel>
                  <FormControl>
                    <Input disabled={disabled} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trustPilotScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TrustPilot Score</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      disabled={disabled}
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          Number.parseFloat(e.target.value) || undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Auto-calculated fields display */}
            {form.getValues("price_for_element_gram") && (
              <div className="border border-primary/20 p-4 rounded-md bg-primary/5">
                <h3 className="font-medium mb-2">Calculated Values</h3>
                {(watchType === "proteine" ||
                  watchType === "weight_gainer") && (
                  <div className="flex justify-between">
                    <span>Price per 100g protein:</span>
                    <span className="font-medium">
                      €{form.getValues("price_for_element_gram")}
                    </span>
                  </div>
                )}
                {watchType === "creatine" && (
                  <div className="flex justify-between">
                    <span>Price per 100g creatine:</span>
                    <span className="font-medium">
                      €{form.getValues("price_for_element_gram")}
                    </span>
                  </div>
                )}
                {watchType === "weight_gainer" &&
                  form.getValues("price_per_100_calories") && (
                    <div className="flex justify-between mt-1">
                      <span>Price per 100 calories:</span>
                      <span className="font-medium">
                        €{form.getValues("price_per_100_calories")}
                      </span>
                    </div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="discount_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Type</FormLabel>
                  <Select
                    disabled={disabled}
                    onValueChange={field.onChange}
                    value={field.value}
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
              name="discount_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Code</FormLabel>
                  <FormControl>
                    <Input disabled={disabled} {...field} />
                  </FormControl>
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
                    <Input disabled={disabled} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Enabled</FormLabel>
                    <FormDescription>
                      Show this product on the website
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enabled_top10"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Enabled in Top 10</FormLabel>
                    <FormDescription>
                      Include this product in top 10 listings
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scrape_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Scraping Enabled</FormLabel>
                    <FormDescription>
                      Allow automatic price scraping for this product
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="warning"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Warning Flag</FormLabel>
                    <FormDescription>
                      Mark this product with a warning flag
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scraper Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="scraper"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ScraperActions
                      value={field.value}
                      onChange={field.onChange}
                      disabled={disabled}
                      url={form.getValues("url")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {!disabled && (
          <Button type="submit" className="w-full md:w-auto">
            <Save className="mr-2 h-4 w-4" />
            Save Product
          </Button>
        )}
      </form>
    </Form>
  );
}

function ProductStats({ product }: { product: Product }) {
  // Format data for charts
  const clickData =
    product.count_clicked?.map((click) => ({
      date: new Date(click.date).toLocaleDateString(),
    })) || [];

  const priceHistoryData =
    product.price_history?.map((history) => ({
      date: new Date(history.date).toLocaleDateString(),
      price: history.scrapedData,
    })) || [];

  const clickCounts: Record<string, number> = {};
  clickData.forEach((click) => {
    clickCounts[click.date] = (clickCounts[click.date] || 0) + 1;
  });

  const clickChartData = Object.entries(clickCounts).map(([date, count]) => ({
    date,
    clicks: count,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">Click Statistics</h3>
              <div className="text-2xl font-bold">
                {product.count_clicked?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Total clicks</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Top 10 Appearances</h3>
              <div className="text-2xl font-bold">
                {product.count_top10?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                Times appeared in top 10
              </p>
            </div>
          </div>

          {priceHistoryData.length > 0 ? (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Price History</h3>
              <div className="h-[300px] border rounded-md p-4">
                <div className="text-center text-sm text-muted-foreground">
                  Price history chart would be displayed here
                </div>
              </div>
            </div>
          ) : (
            <Alert className="mt-6">
              <AlertTitle>No price history</AlertTitle>
              <AlertDescription>
                This product doesn't have any price history data yet.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
