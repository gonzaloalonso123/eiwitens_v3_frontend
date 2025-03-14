"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, BarChart2, LineChartIcon } from "lucide-react";
import { TimeSeriesChart } from "./chart-components";
import { getClicksOverTimeData, type ClickData } from "@/lib/analytics-service";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function ClicksOverTime() {
  const [startDate, setStartDate] = useState<Date>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [groupByProduct, setGroupByProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ClickData[]>([]);
  const [legend, setLegend] = useState<
    Array<{ name: string; key: string; clicks: number; color: string }>
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { chartData, legend } = await getClicksOverTimeData(
          startDate,
          endDate,
          groupByProduct
        );
        setChartData(chartData);
        setLegend(legend);
      } catch (error) {
        console.error("Error fetching click data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, groupByProduct]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(startDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(endDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && setEndDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex gap-2">
          <Button
            variant={groupByProduct ? "outline" : "default"}
            onClick={() => setGroupByProduct(false)}
          >
            <LineChartIcon className="mr-2 h-4 w-4" />
            Total Clicks
          </Button>
          <Button
            variant={groupByProduct ? "default" : "outline"}
            onClick={() => setGroupByProduct(true)}
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            By Product
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex justify-center items-center h-[400px]">
            <LoadingSpinner className="h-8 w-8" />
          </CardContent>
        </Card>
      ) : (
        <TimeSeriesChart data={chartData} series={legend} chartType="line" />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding Click Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            This chart shows the number of clicks on your products over time.
            You can use this data to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Identify trends in user engagement</li>
            <li>Measure the impact of marketing campaigns</li>
            <li>Compare performance between different products</li>
            <li>Spot seasonal patterns in user behavior</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Switch between "Total Clicks" and "By Product" views to analyze your
            data from different perspectives. Use the date selectors to adjust
            the time period for your analysis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
