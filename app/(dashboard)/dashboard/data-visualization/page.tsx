"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Search, TrendingUp, Package, Filter } from "lucide-react"
import { getProducts } from "@/lib/product-service"

interface PricePoint {
    scrapedData: number
    date: {
        seconds: number
        nanoseconds: number
    }
}

interface Product {
    id: string
    name: string
    type: string
    subtypes: string[]
    store: string
    price_history: PricePoint[]
}

interface ProcessedDataPoint {
    date: string
    timestamp: number
    price: number
    category: string
}

// Function to filter out anomalous prices
function filterAnomalousData(priceHistory: PricePoint[]): PricePoint[] {
    if (priceHistory.length < 3) return priceHistory

    const prices = priceHistory.map((p) => p.scrapedData).filter((p) => p > 0)
    if (prices.length === 0) return []

    // Calculate Q1, Q3, and IQR
    const sortedPrices = [...prices].sort((a, b) => a - b)
    const q1Index = Math.floor(sortedPrices.length * 0.25)
    const q3Index = Math.floor(sortedPrices.length * 0.75)
    const q1 = sortedPrices[q1Index]
    const q3 = sortedPrices[q3Index]
    const iqr = q3 - q1

    // Define outlier bounds (more conservative approach)
    const lowerBound = q1 - 2.5 * iqr
    const upperBound = q3 + 2.5 * iqr

    // Also use median-based filtering for additional safety
    const median = sortedPrices[Math.floor(sortedPrices.length / 2)]
    const medianLowerBound = median * 0.3 // Price shouldn't be less than 30% of median
    const medianUpperBound = median * 3 // Price shouldn't be more than 300% of median

    const finalLowerBound = Math.max(lowerBound, medianLowerBound)
    const finalUpperBound = Math.min(upperBound, medianUpperBound)

    return priceHistory.filter((point) => {
        const price = point.scrapedData
        return price > 0 && price >= finalLowerBound && price <= finalUpperBound
    })
}

// Function to convert timestamp to date string
function timestampToDate(seconds: number): string {
    return new Date(seconds * 1000).toISOString().split("T")[0]
}

// Function to process products and group by categories
function processProductData(products: Product[]): { [key: string]: ProcessedDataPoint[] } {
    const categoryData: { [key: string]: ProcessedDataPoint[] } = {}


    console.log(products.filter(p => p?.price_history?.length > 0), "products with price history")
    products.forEach((product) => {
        // Filter anomalous data first
        const cleanedHistory = product.price_history ? filterAnomalousData(product.price_history) : []

        // Create category combinations
        const categories = [
            product.type, // Main type
            ...product.subtypes.map((subtype) => `${product.type}_${subtype}`), // Type + subtype combinations
            ...product.subtypes, // Individual subtypes
        ]

        categories.forEach((category) => {
            if (!categoryData[category]) {
                categoryData[category] = []
            }

            cleanedHistory.forEach((point) => {
                categoryData[category].push({
                    date: timestampToDate(point.date.seconds),
                    timestamp: point.date.seconds,
                    price: point.scrapedData,
                    category,
                })
            })
        })
    })

    // Calculate average prices per date for each category
    const processedData: { [key: string]: ProcessedDataPoint[] } = {}

    Object.keys(categoryData).forEach((category) => {
        const points = categoryData[category]
        const dateGroups: { [key: string]: number[] } = {}

        points.forEach((point) => {
            if (!dateGroups[point.date]) {
                dateGroups[point.date] = []
            }
            dateGroups[point.date].push(point.price)
        })

        processedData[category] = Object.keys(dateGroups)
            .map((date) => ({
                date,
                timestamp: new Date(date).getTime(),
                price: dateGroups[date].reduce((sum, price) => sum + price, 0) / dateGroups[date].length,
                category,
            }))
            .sort((a, b) => a.timestamp - b.timestamp)
    })

    return processedData
}

export default function PriceEvolutionDashboard() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    useEffect(() => {
        getProducts().then((data) => {
            setProducts(data)
        })
    }, [])

    // Process the data
    const processedData = useMemo(() => processProductData(products), [products])

    // Filter categories based on search term
    const filteredCategories = useMemo(() => {
        return Object.keys(processedData).filter((category) => category.toLowerCase().includes(searchTerm.toLowerCase()))
    }, [processedData, searchTerm])

    // Get statistics
    const stats = useMemo(() => {
        const totalCategories = Object.keys(processedData).length
        const totalDataPoints = Object.values(processedData).reduce((sum, data) => sum + data.length, 0)
        const avgDataPointsPerCategory = totalDataPoints / totalCategories || 0

        return {
            totalCategories,
            totalDataPoints,
            avgDataPointsPerCategory: Math.round(avgDataPointsPerCategory),
        }
    }, [processedData])

    const formatPrice = (value: number) => `€${value.toFixed(2)}`

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">Price Evolution Dashboard</h1>
                    <p className="text-muted-foreground text-lg">
                        Track product price trends across categories with anomaly-filtered data
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalCategories}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalDataPoints}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Points/Category</CardTitle>
                            <Filter className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avgDataPointsPerCategory}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search Bar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Search Categories
                        </CardTitle>
                        <CardDescription>Find specific product categories and price trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Input
                            placeholder="Search categories (e.g., proteine, whey, supplement)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-md"
                        />
                    </CardContent>
                </Card>

                {/* Category Badges */}
                {searchTerm && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Found Categories ({filteredCategories.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {filteredCategories.map((category) => (
                                    <Badge
                                        key={category}
                                        variant={selectedCategory === category ? "default" : "secondary"}
                                        className="cursor-pointer"
                                        onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                                    >
                                        {category} ({processedData[category].length} points)
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {(selectedCategory ? [selectedCategory] : filteredCategories.slice(0, 6)).map((category) => {
                        const data = processedData[category]
                        if (!data || data.length === 0) return null

                        const minPrice = Math.min(...data.map((d) => d.price))
                        const maxPrice = Math.max(...data.map((d) => d.price))
                        const avgPrice = data.reduce((sum, d) => sum + d.price, 0) / data.length

                        return (
                            <Card key={category} className="col-span-1">
                                <CardHeader>
                                    <CardTitle className="text-lg capitalize">{category.replace(/_/g, " ")}</CardTitle>
                                    <CardDescription>
                                        Average: {formatPrice(avgPrice)} | Range: {formatPrice(minPrice)} - {formatPrice(maxPrice)}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={data}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" tickFormatter={formatDate} angle={-45} textAnchor="end" height={60} />
                                                <YAxis tickFormatter={formatPrice} domain={["dataMin - 5", "dataMax + 5"]} />
                                                <Tooltip
                                                    labelFormatter={formatDate}
                                                    formatter={(value: number) => [formatPrice(value), "Average Price"]}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="price"
                                                    stroke="hsl(var(--primary))"
                                                    strokeWidth={2}
                                                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {filteredCategories.length === 0 && searchTerm && (
                    <Card>
                        <CardContent className="text-center py-8">
                            <p className="text-muted-foreground">No categories found matching "{searchTerm}"</p>
                        </CardContent>
                    </Card>
                )}

                {!searchTerm && (
                    <Card>
                        <CardContent className="text-center py-8">
                            <p className="text-muted-foreground">
                                Use the search bar above to find specific product categories and view their price evolution graphs.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
