"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Upload, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { sendIngredientsImage } from "@/lib/api-service";

interface AIIngredientDetectorProps {
  onIngredientsDetected: (
    ingredients: { name: string; amount: number }[]
  ) => void;
}

export function AIIngredientDetector({
  onIngredientsDetected,
}: AIIngredientDetectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!fileInputRef.current?.files?.length) {
      toast({
        title: "No image selected",
        description: "Please select an image to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const ingredients = await sendIngredientsImage(
      fileInputRef.current?.files[0]
    );

    if (Array.isArray(ingredients)) {
      const processedIngredients = ingredients.map((ingredient: any) => ({
        name: ingredient.name,
        amount: Number.parseFloat(ingredient.amount) || 0,
      }));

      onIngredientsDetected(processedIngredients);
      setIsOpen(false);
      setImagePreview(null);

      toast({
        title: "Ingredients detected",
        description: `Found ${processedIngredients.length} ingredients in the image`,
      });
    } else {
      throw new Error("Invalid response format");
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Detect Ingredients with AI
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detect Ingredients with AI</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />

              {imagePreview && (
                <div className="border rounded-md overflow-hidden w-full max-h-[300px]">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div className="text-sm text-muted-foreground text-center">
                Upload an image of a product label or ingredients list to
                automatically detect ingredients and their amounts
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAnalyzeImage}
              disabled={isLoading || !imagePreview}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Analyze Image
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
