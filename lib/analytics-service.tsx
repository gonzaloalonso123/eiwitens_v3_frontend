import { getProducts } from "@/lib/product-service";

export interface ClickData {
  date: string;
  clicks: number;
  [key: string]: any;
}

export interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

// Update the AnalyticsSummary interface to include rogiersChoiceClicks
export interface AnalyticsSummary {
  totalClicks: number;
  totalProducts: number;
  activeProducts: number;
  rogiersChoiceClicks: number;
  topPerformingProducts: Array<{
    id: string;
    name: string;
    store: string;
    clicks: number;
  }>;
  storeDistribution: Array<{
    store: string;
    products: number;
    clicks: number;
  }>;
}

// Helper function to format date
export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Helper to generate consistent colors for charts
export const generateColor = (index: number): string => {
  const colors = [
    "#00bcd4", // Primary turquoise
    "#f97316", // Orange
    "#3b82f6", // Blue
    "#10b981", // Green
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#f59e0b", // Amber
    "#6366f1", // Indigo
    "#ef4444", // Red
    "#84cc16", // Lime
  ];

  return colors[index % colors.length];
};

// Get clicks over time data
export const getClicksOverTimeData = async (
  startDate: Date,
  endDate: Date,
  groupByProduct = false
): Promise<{
  chartData: ClickData[];
  legend: Array<{ name: string; key: string; clicks: number; color: string }>;
}> => {
  const products = await getProducts();
  const productsWithClicks = products.filter(
    (p) => p.count_clicked && p.count_clicked.length > 0
  );

  // Create date range
  const dateRange: Date[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dateRange.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (groupByProduct) {
    // Group by product
    const chartData = dateRange.map((date) => {
      const dateStr = formatDate(date);
      const dataPoint: ClickData = { date: dateStr, clicks: 0 };

      productsWithClicks.forEach((product) => {
        const productClicks = (product.count_clicked || []).filter(
          (click) => formatDate(new Date(click.date)) === dateStr
        ).length;

        if (productClicks > 0) {
          dataPoint[product.name] = productClicks;
          dataPoint.clicks += productClicks;
        }
      });

      return dataPoint;
    });

    // Create legend
    const legend = productsWithClicks
      .map((product, index) => ({
        name: `${product.store} - ${product.name}`,
        key: product.name,
        clicks: (product.count_clicked || []).length,
        color: generateColor(index),
      }))
      .sort((a, b) => b.clicks - a.clicks);

    return { chartData, legend };
  } else {
    // Total clicks per day
    const chartData = dateRange.map((date) => {
      const dateStr = formatDate(date);
      const clicks = productsWithClicks.reduce((total, product) => {
        return (
          total +
          (product.count_clicked || []).filter(
            (click) => formatDate(new Date(click.date)) === dateStr
          ).length
        );
      }, 0);

      return { date: dateStr, clicks };
    });

    // Simple legend for total clicks
    const legend = [
      {
        name: "Total Clicks",
        key: "clicks",
        clicks: productsWithClicks.reduce(
          (total, product) => total + (product.count_clicked || []).length,
          0
        ),
        color: generateColor(0),
      },
    ];

    return { chartData, legend };
  }
};

// Get product performance data for pie chart
export const getProductPerformanceData = async (): Promise<PieChartData[]> => {
  const products = await getProducts();
  const productsWithClicks = products
    .filter((p) => p.count_clicked && p.count_clicked.length > 0)
    .sort(
      (a, b) => (b.count_clicked?.length || 0) - (a.count_clicked?.length || 0)
    );

  const pieData: PieChartData[] = [];

  // Take top 5 products
  productsWithClicks.forEach((product, index) => {
    if (index < 5) {
      pieData.push({
        name: `${product.store} - ${product.name}`,
        value: product.count_clicked?.length || 0,
        color: generateColor(index),
      });
    } else if (index === 5) {
      pieData.push({
        name: "Other",
        value: product.count_clicked?.length || 0,
        color: generateColor(5),
      });
    } else {
      pieData[5].value += product.count_clicked?.length || 0;
    }
  });

  return pieData;
};

// Get store analytics data
export const getStoreAnalyticsData = async (): Promise<{
  storeClicks: PieChartData[];
  storeProducts: PieChartData[];
}> => {
  const products = await getProducts();

  // Group by store
  const storeData: Record<string, { clicks: number; products: number }> = {};

  products.forEach((product) => {
    if (!storeData[product.store]) {
      storeData[product.store] = { clicks: 0, products: 0 };
    }

    storeData[product.store].products++;
    storeData[product.store].clicks += product.count_clicked?.length || 0;
  });

  // Convert to chart data
  const storeEntries = Object.entries(storeData);

  const storeClicks: PieChartData[] = storeEntries
    .map(([store, data], index) => ({
      name: store,
      value: data.clicks,
      color: generateColor(index),
    }))
    .sort((a, b) => b.value - a.value);

  const storeProducts: PieChartData[] = storeEntries
    .map(([store, data], index) => ({
      name: store,
      value: data.products,
      color: generateColor(index),
    }))
    .sort((a, b) => b.value - a.value);

  return { storeClicks, storeProducts };
};

// Update the getAnalyticsSummary function to include rogiersChoiceClicks
export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const products = await getProducts();

  const totalClicks = products.reduce(
    (total, product) => total + (product.count_clicked?.length || 0),
    0
  );

  const activeProducts = products.filter((p) => p.enabled).length;

  // Calculate Rogier's Choice clicks
  const rogiersChoiceClicks = products.reduce(
    (total, product) =>
      total +
      (product.count_clicked?.filter((click) => click.rogier_choice)?.length ||
        0),
    0
  );

  const topPerformingProducts = products
    .filter((p) => p.count_clicked && p.count_clicked.length > 0)
    .map((p) => ({
      id: p.id || "",
      name: p.name,
      store: p.store,
      clicks: p.count_clicked?.length || 0,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  // Group by store
  const storeMap: Record<string, { products: number; clicks: number }> = {};

  products.forEach((product) => {
    if (!storeMap[product.store]) {
      storeMap[product.store] = { products: 0, clicks: 0 };
    }

    storeMap[product.store].products++;
    storeMap[product.store].clicks += product.count_clicked?.length || 0;
  });

  const storeDistribution = Object.entries(storeMap)
    .map(([store, data]) => ({
      store,
      products: data.products,
      clicks: data.clicks,
    }))
    .sort((a, b) => b.clicks - a.clicks);

  return {
    totalClicks,
    totalProducts: products.length,
    activeProducts,
    rogiersChoiceClicks,
    topPerformingProducts,
    storeDistribution,
  };
};
