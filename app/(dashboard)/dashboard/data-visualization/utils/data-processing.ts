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

/**
 * Advanced anomaly detection function that filters out unrealistic price data
 * Uses multiple statistical methods to ensure data quality
 */
export function filterAnomalousData(priceHistory: PricePoint[]): PricePoint[] {
    if (priceHistory.length < 3) return priceHistory

    // Filter out zero or negative prices first
    const validPrices = priceHistory.filter((p) => p.scrapedData > 0)
    if (validPrices.length === 0) return []

    const prices = validPrices.map((p) => p.scrapedData)
    const sortedPrices = [...prices].sort((a, b) => a - b)

    // Method 1: Interquartile Range (IQR) method
    const q1Index = Math.floor(sortedPrices.length * 0.25)
    const q3Index = Math.floor(sortedPrices.length * 0.75)
    const q1 = sortedPrices[q1Index]
    const q3 = sortedPrices[q3Index]
    const iqr = q3 - q1

    // Conservative outlier bounds (2.5 * IQR instead of 1.5)
    const iqrLowerBound = q1 - 2.5 * iqr
    const iqrUpperBound = q3 + 2.5 * iqr

    // Method 2: Median-based filtering
    const median = sortedPrices[Math.floor(sortedPrices.length / 2)]
    const medianLowerBound = median * 0.2 // Price shouldn't be less than 20% of median
    const medianUpperBound = median * 4 // Price shouldn't be more than 400% of median

    // Method 3: Standard deviation method (as backup)
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length
    const stdDev = Math.sqrt(variance)
    const stdLowerBound = mean - 3 * stdDev
    const stdUpperBound = mean + 3 * stdDev

    // Combine all methods - use the most restrictive bounds
    const finalLowerBound = Math.max(iqrLowerBound, medianLowerBound, stdLowerBound, 0.01)
    const finalUpperBound = Math.min(iqrUpperBound, medianUpperBound, stdUpperBound)

    // Additional check: detect sudden price jumps
    const filteredByBounds = validPrices.filter((point) => {
        const price = point.scrapedData
        return price >= finalLowerBound && price <= finalUpperBound
    })

    // Sort by timestamp for jump detection
    const sortedByTime = filteredByBounds.sort((a, b) => a.date.seconds - b.date.seconds)

    // Remove points that represent unrealistic jumps (>300% or <25% of previous price)
    const finalFiltered = sortedByTime.filter((point, index) => {
        if (index === 0) return true

        const prevPrice = sortedByTime[index - 1].scrapedData
        const currentPrice = point.scrapedData
        const ratio = currentPrice / prevPrice

        // Allow reasonable price variations (between 25% and 300% of previous price)
        return ratio >= 0.25 && ratio <= 3.0
    })

    return finalFiltered
}

/**
 * Process multiple products and create category-based price evolution data
 */
export function processProductsForVisualization(products: Product[]) {
    const categoryData: { [key: string]: Array<{ date: string; price: number; productId: string }> } = {}

    products.forEach((product) => {
        // Clean the price history
        const cleanedHistory = filterAnomalousData(product.price_history)

        if (cleanedHistory.length === 0) return

        // Generate all possible categories for this product
        const categories = generateCategories(product.type, product.subtypes)

        categories.forEach((category) => {
            if (!categoryData[category]) {
                categoryData[category] = []
            }

            cleanedHistory.forEach((point) => {
                categoryData[category].push({
                    date: new Date(point.date.seconds * 1000).toISOString().split("T")[0],
                    price: point.scrapedData,
                    productId: product.id,
                })
            })
        })
    })

    // Calculate daily averages for each category
    const processedData: { [key: string]: Array<{ date: string; averagePrice: number; dataPoints: number }> } = {}

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
                averagePrice: dateGroups[date].reduce((sum, price) => sum + price, 0) / dateGroups[date].length,
                dataPoints: dateGroups[date].length,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    })

    return processedData
}

/**
 * Generate all possible category combinations for a product
 */
function generateCategories(type: string, subtypes: string[]): string[] {
    const categories = new Set<string>()

    // Add main type
    categories.add(type)

    // Add individual subtypes
    subtypes.forEach((subtype) => {
        categories.add(subtype)
    })

    // Add type + subtype combinations
    subtypes.forEach((subtype) => {
        categories.add(`${type}_${subtype}`)
    })

    // Add combinations of subtypes (for products with multiple subtypes)
    if (subtypes.length > 1) {
        for (let i = 0; i < subtypes.length; i++) {
            for (let j = i + 1; j < subtypes.length; j++) {
                categories.add(`${subtypes[i]}_${subtypes[j]}`)
            }
        }
    }

    return Array.from(categories)
}

/**
 * Get statistics about the processed data
 */
export function getDataStatistics(processedData: { [key: string]: any[] }) {
    const categories = Object.keys(processedData)
    const totalDataPoints = Object.values(processedData).reduce((sum, data) => sum + data.length, 0)

    const categoryStats = categories.map((category) => {
        const data = processedData[category]
        const prices = data.map((d: any) => d.averagePrice || d.price)

        return {
            category,
            dataPoints: data.length,
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            avgPrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
            priceRange: Math.max(...prices) - Math.min(...prices),
        }
    })

    return {
        totalCategories: categories.length,
        totalDataPoints,
        avgDataPointsPerCategory: Math.round(totalDataPoints / categories.length),
        categoryStats: categoryStats.sort((a, b) => b.dataPoints - a.dataPoints),
    }
}
