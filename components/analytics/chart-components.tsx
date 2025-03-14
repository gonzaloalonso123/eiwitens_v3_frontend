"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart, LineChart, PieChart } from "recharts"
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Pie,
  Cell,
  Area,
  AreaChart,
  Legend,
} from "recharts"
import { BarChart2, LineChartIcon } from "lucide-react"
import type { ClickData, PieChartData } from "@/lib/analytics-service"

// Custom tooltip component for charts
export function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-md shadow-md">
        <p className="text-sm font-medium mb-2">{label}</p>
        <div className="space-y-1">
          {payload
            .filter((item: any) => item.value > 0)
            .map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="font-medium">{item.name}:</span>
                <span>{item.value}</span>
              </div>
            ))}
        </div>
      </div>
    )
  }

  return null
}

// Chart type selector
interface ChartTypeSelectorProps {
  chartType: "line" | "area" | "bar"
  onChange: (type: "line" | "area" | "bar") => void
}

export function ChartTypeSelector({ chartType, onChange }: ChartTypeSelectorProps) {
  return (
    <div className="flex space-x-2">
      <Button variant={chartType === "line" ? "default" : "outline"} size="sm" onClick={() => onChange("line")}>
        <LineChartIcon className="h-4 w-4 mr-2" />
        Line
      </Button>
      <Button variant={chartType === "area" ? "default" : "outline"} size="sm" onClick={() => onChange("area")}>
        <LineChartIcon className="h-4 w-4 mr-2" />
        Area
      </Button>
      <Button variant={chartType === "bar" ? "default" : "outline"} size="sm" onClick={() => onChange("bar")}>
        <BarChart2 className="h-4 w-4 mr-2" />
        Bar
      </Button>
    </div>
  )
}

// Series selector component
interface SeriesSelectorProps {
  series: Array<{ name: string; key: string; clicks: number; color: string }>
  activeSeries: string[]
  onChange: (activeSeries: string[]) => void
}

export function SeriesSelector({ series, activeSeries, onChange }: SeriesSelectorProps) {
  const handleToggle = (key: string) => {
    if (activeSeries.includes(key)) {
      onChange(activeSeries.filter((k) => k !== key))
    } else {
      onChange([...activeSeries, key])
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Data Series</CardTitle>
        <CardDescription>Select series to display</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-2">
            {series.map((item) => (
              <div key={item.key} className="flex items-center space-x-2">
                <Checkbox
                  id={`series-${item.key}`}
                  checked={activeSeries.includes(item.key)}
                  onCheckedChange={() => handleToggle(item.key)}
                />
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <Label htmlFor={`series-${item.key}`} className="text-sm flex-1 cursor-pointer">
                    {item.name}
                  </Label>
                  <span className="text-xs text-muted-foreground">{item.clicks}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Time series chart component
interface TimeSeriesChartProps {
  data: ClickData[]
  series: Array<{ name: string; key: string; clicks: number; color: string }>
  chartType?: "line" | "area" | "bar"
}

export function TimeSeriesChart({ data, series, chartType = "line" }: TimeSeriesChartProps) {
  const [activeChartType, setActiveChartType] = useState<"line" | "area" | "bar">(chartType)
  const [activeSeries, setActiveSeries] = useState<string[]>(series.slice(0, 5).map((s) => s.key))

  // Filter data to only include active series
  const filteredSeries = series.filter((s) => activeSeries.includes(s.key))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-3/4">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Clicks Over Time</CardTitle>
                <CardDescription>Click trends for selected products and time period</CardDescription>
              </div>
              <ChartTypeSelector chartType={activeChartType} onChange={setActiveChartType} />
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {activeChartType === "line" ? (
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getDate()}/${date.getMonth() + 1}`
                        }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      {filteredSeries.map((item) => (
                        <Line
                          key={item.key}
                          type="monotone"
                          dataKey={item.key}
                          name={item.name}
                          stroke={item.color}
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      ))}
                    </LineChart>
                  ) : activeChartType === "area" ? (
                    <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getDate()}/${date.getMonth() + 1}`
                        }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      {filteredSeries.map((item) => (
                        <Area
                          key={item.key}
                          type="monotone"
                          dataKey={item.key}
                          name={item.name}
                          stroke={item.color}
                          fill={item.color}
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      ))}
                    </AreaChart>
                  ) : (
                    <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getDate()}/${date.getMonth() + 1}`
                        }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      {filteredSeries.map((item) => (
                        <Bar key={item.key} dataKey={item.key} name={item.name} fill={item.color} />
                      ))}
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-1/4">
          <SeriesSelector series={series} activeSeries={activeSeries} onChange={setActiveSeries} />
        </div>
      </div>
    </div>
  )
}

// Pie chart component
interface PieChartComponentProps {
  data: PieChartData[]
  title: string
  description?: string
}

// Update the PieChartComponent to completely remove labels and improve the tooltip

// Find the PieChartComponent function and replace it with this improved version:
export function PieChartComponent({ data, title, description }: PieChartComponentProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={80} // Reduced from 100 to give more space for legend
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value} clicks (${((value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)`,
                  props.payload.name,
                ]}
                contentStyle={{
                  borderRadius: "6px",
                  padding: "8px 12px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
              />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{
                  maxHeight: "250px",
                  overflowY: "auto",
                  paddingRight: "10px",
                  marginRight: "-10px",
                }}
                formatter={(value, entry, index) => (
                  <span
                    style={{
                      color: "var(--foreground)",
                      fontSize: "12px",
                      display: "inline-block",
                      maxWidth: "120px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

