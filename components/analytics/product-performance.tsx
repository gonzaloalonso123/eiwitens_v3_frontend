"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PieChartComponent } from "./chart-components"
import { getProductPerformanceData, type PieChartData } from "@/lib/analytics-service"
import { getProducts, type Product } from "@/lib/product-service"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Link from "next/link"

export function ProductPerformance() {
  const [pieData, setPieData] = useState<PieChartData[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const pieData = await getProductPerformanceData()
        const products = await getProducts()

        setPieData(pieData)
        setProducts(products)
      } catch (error) {
        console.error("Error fetching product performance data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Sort products by click count
  const sortedProducts = [...products]
    .filter((p) => p.count_clicked && p.count_clicked.length > 0)
    .sort((a, b) => (b.count_clicked?.length || 0) - (a.count_clicked?.length || 0))
    .slice(0, 10)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PieChartComponent
          data={pieData}
          title="Click Distribution by Product"
          description="Percentage of total clicks by product"
        />

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Products by Clicks</CardTitle>
            <CardDescription>Products with the highest number of clicks</CardDescription>
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
                {sortedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      No click data available
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/products/edit/${product.id}`} className="hover:underline">
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>{product.store}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{product.count_clicked?.length || 0}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Performance Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This section shows which products are generating the most user engagement. Use this data to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Identify your most popular products</li>
            <li>Determine which products to feature prominently</li>
            <li>Find opportunities to promote underperforming products</li>
            <li>Make data-driven decisions about your product catalog</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Click on a product name in the table to view and edit its details. Consider updating product information or
            pricing for items with low engagement.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

