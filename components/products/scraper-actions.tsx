"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Trash2, Plus, AlertTriangle, Check } from "lucide-react";
import { actionTypes, defaultAction } from "@/lib/constants";
import type { ScraperAction } from "@/lib/product-service";
import { useToast } from "@/components/ui/use-toast";
import { testScraper } from "@/lib/api-service";

interface ScraperActionsProps {
  value: ScraperAction[];
  onChange: (value: ScraperAction[]) => void;
  disabled?: boolean;
  url: string;
}

export function ScraperActions({
  value = [],
  onChange,
  disabled = false,
  url,
}: ScraperActionsProps) {
  const [testResult, setTestResult] = useState<{
    success: boolean;
    price?: number;
    error?: {
      index: number;
      text: string;
      screenshot?: string;
    };
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const handleAddAction = () => {
    const newAction = {
      ...defaultAction,
      id: uuidv4(),
    };
    onChange([...value, newAction]);
  };

  const handleRemoveAction = (index: number) => {
    const newActions = [...value];
    newActions.splice(index, 1);
    onChange(newActions);
  };

  const handleUpdateAction = (
    index: number,
    field: string,
    fieldValue: string
  ) => {
    const newActions = [...value];
    newActions[index] = {
      ...newActions[index],
      [field]: fieldValue,
    };
    onChange(newActions);
  };

  const handleTestScraper = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a URL before testing the scraper",
        variant: "destructive",
      });
      return;
    }

    if (value.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one scraper action",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Call the API to test the scraper
      const result = await testScraper(url, value);

      if (
        result &&
        result.price !== undefined &&
        (!result.error || result.error.index === -1)
      ) {
        setTestResult({
          success: true,
          price: result.price,
        });

        toast({
          title: "Success",
          description: "Scraper test completed successfully",
        });
      } else if (result && result.error) {
        setTestResult({
          success: false,
          error: {
            index: result.error.index,
            text: result.error.text || "Failed to execute scraper actions",
            screenshot: result.error.screenshot,
          },
        });

        toast({
          title: "Error",
          description: "Scraper test failed",
          variant: "destructive",
        });
      } else {
        setTestResult({
          success: false,
          error: {
            index: 0,
            text: "Unexpected response format from server",
          },
        });

        toast({
          title: "Error",
          description: "Unexpected response from server",
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: {
          index: 0,
          text: "An unexpected error occurred",
        },
      });

      toast({
        title: "Error",
        description: "An unexpected error occurred while testing the scraper",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      {value.map((action, index) => (
        <div key={action.id} className="space-y-4">
          <Card
            className={`border ${
              testResult?.error?.index === index ? "border-red-500" : ""
            }`}
          >
            <CardContent className="pt-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  {testResult?.error?.index === index && (
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <h3 className="font-medium">Action {index + 1}</h3>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveAction(index)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    disabled={disabled}
                    value={action.type}
                    onValueChange={(value) =>
                      handleUpdateAction(index, "type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action type" />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    disabled={disabled}
                    value={action.selector}
                    onValueChange={(value) =>
                      handleUpdateAction(index, "selector", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select selector type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="css">By CSS</SelectItem>
                      <SelectItem value="xpath">By XPATH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  placeholder="XPATH"
                  value={action.xpath}
                  onChange={(e) =>
                    handleUpdateAction(index, "xpath", e.target.value)
                  }
                  disabled={disabled}
                />

                {action.type === "selectOption" && (
                  <Input
                    placeholder="Option Text"
                    value={action.optionText || ""}
                    onChange={(e) =>
                      handleUpdateAction(index, "optionText", e.target.value)
                    }
                    disabled={disabled}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {testResult?.error?.index === index && (
            <ErrorDisplay error={testResult.error} />
          )}
        </div>
      ))}

      <Button
        variant="outline"
        onClick={handleAddAction}
        disabled={disabled}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Action
      </Button>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 bg-primary/10 rounded-md flex items-center justify-center">
                <img
                  src="/placeholder.svg?height=64&width=64"
                  alt="Scraper"
                  width={40}
                  height={40}
                />
              </div>
            </div>

            <div className="flex-grow space-y-4">
              <Button
                onClick={handleTestScraper}
                disabled={disabled || testing || value.length === 0}
                className="w-full"
              >
                {testing ? "Testing..." : "Test Scraper Actions"}
              </Button>

              {testResult && testResult.success && (
                <Alert
                  variant="default"
                  className="bg-green-50 border-green-200"
                >
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span className="font-medium">
                      {testResult.price === 0
                        ? "No price data retrieved"
                        : `Retrieved Price: €${testResult.price}`}
                    </span>
                  </div>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorDisplay({
  error,
}: {
  error: { text: string; screenshot?: string };
}) {
  return (
    <div className="border-2 border-red-500 rounded-md overflow-hidden">
      <div className="bg-red-500 text-white px-3 py-1 flex items-center">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <span>Error</span>
      </div>
      <div className="p-4 bg-red-50">
        <p className="text-red-700 mb-4">{error.text}</p>

        {error.screenshot && (
          <div className="rounded-md overflow-hidden border border-red-200">
            <div className="bg-red-500 text-white px-3 py-1 text-sm">
              Error Screenshot
            </div>
            <div className="bg-white">
              <img
                src={`data:image/png;base64,${error.screenshot}`}
                alt="Error Screenshot"
                className="w-full h-auto"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
