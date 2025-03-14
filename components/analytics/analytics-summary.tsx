"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  getAnalyticsSummary,
  type AnalyticsSummary as AnalyticsSummaryType,
} from "@/lib/analytics-service";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  BarChart,
  LineChart,
  PieChart,
  ArrowRight,
  TrendingUp,
  Package,
  Store,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import rogierImage from "@/images/rogier.webp";

function RogiersChoiceClicks({ count }: { count: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rogier's Choice Clicks</CardTitle>
        <CardDescription>
          Total clicks on Rogier's recommended products
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4">
          <div className="text-6xl font-bold">{count}</div>
          <div className="rounded-full p-2 flex items-center justify-center">
            <Image
              src={rogierImage}
              alt="Rogier"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsSummary() {
  const [data, setData] = useState<AnalyticsSummaryType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const summaryData = await getAnalyticsSummary();
        setData(summaryData);
      } catch (error) {
        console.error("Error fetching analytics summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">Failed to load analytics data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Clicks"
          value={data.totalClicks}
          description="Total product clicks"
          icon={<TrendingUp className="h-5 w-5" />}
          linkTo="#"
          linkText="View click details"
          onClick={() =>
            document.querySelector('[data-value="clicks"]')?.click()
          }
        />

        <MetricCard
          title="Total Products"
          value={data.totalProducts}
          description="Products in database"
          icon={<Package className="h-5 w-5" />}
          linkTo="#"
          linkText="Manage products"
          onClick={() =>
            document.querySelector('[data-value="products"]')?.click()
          }
        />

        <MetricCard
          title="Active Products"
          value={data.activeProducts}
          description="Currently enabled products"
          icon={<Package className="h-5 w-5" />}
          linkTo="#"
          linkText="Manage products"
          onClick={() =>
            document.querySelector('[data-value="products"]')?.click()
          }
        />

        <MetricCard
          title="Stores"
          value={data.storeDistribution.length}
          description="Unique stores"
          icon={<Store className="h-5 w-5" />}
          linkTo="#"
          linkText="View store analytics"
          onClick={() =>
            document.querySelector('[data-value="stores"]')?.click()
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <RogiersChoiceClicks count={data.rogiersChoiceClicks} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>Products with the most clicks</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topPerformingProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-4 text-muted-foreground"
                    >
                      No click data available
                    </TableCell>
                  </TableRow>
                ) : (
                  data.topPerformingProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/products/edit/${product.id}`}
                          className="hover:underline"
                        >
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>{product.store}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{product.clicks}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/analytics/products">
                View all product analytics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Stores</CardTitle>
            <CardDescription>Stores with the most clicks</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.storeDistribution.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-4 text-muted-foreground"
                    >
                      No store data available
                    </TableCell>
                  </TableRow>
                ) : (
                  data.storeDistribution.slice(0, 5).map((store) => (
                    <TableRow key={store.store}>
                      <TableCell className="font-medium">
                        {store.store}
                      </TableCell>
                      <TableCell>{store.products}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{store.clicks}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/analytics/stores">
                View all store analytics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
          <CardDescription>
            Quick access to all analytics features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnalyticsCard
              title="Clicks Over Time"
              description="Track click trends and patterns"
              icon={<LineChart className="h-8 w-8" />}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('[data-value="clicks"]')?.click();
              }}
            />

            <AnalyticsCard
              title="Product Performance"
              description="Analyze product engagement"
              icon={<BarChart className="h-8 w-8" />}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('[data-value="products"]')?.click();
              }}
            />

            <AnalyticsCard
              title="Store Analytics"
              description="Compare store performance"
              icon={<PieChart className="h-8 w-8" />}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('[data-value="stores"]')?.click();
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  linkTo: string;
  linkText: string;
  onClick?: (e: React.MouseEvent) => void;
}

function MetricCard({
  title,
  value,
  description,
  icon,
  linkTo,
  linkText,
  onClick,
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-muted-foreground">{title}</div>
          <div className="bg-primary/10 p-2 rounded-full text-primary">
            {icon}
          </div>
        </div>
        <div className="text-3xl font-bold mb-1">{value.toLocaleString()}</div>
        <div className="text-sm text-muted-foreground mb-4">{description}</div>
        <Button variant="link" className="p-0 h-auto" asChild>
          <Link href={linkTo} onClick={onClick}>
            {linkText}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface AnalyticsCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  onClick?: (e: React.MouseEvent) => void;
}

function AnalyticsCard({
  title,
  description,
  icon,
  href,
  onClick,
}: AnalyticsCardProps) {
  return (
    <Card className="overflow-hidden">
      <Link href={href} className="block h-full" onClick={onClick}>
        <div className="p-6 flex flex-col h-full transition-colors hover:bg-muted/50">
          <div className="mb-4 text-primary">{icon}</div>
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <div className="mt-auto flex items-center text-sm text-primary font-medium">
            View details
            <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </div>
      </Link>
    </Card>
  );
}
