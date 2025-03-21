"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Ingredient {
  name: string;
  amount: number;
}

interface IngredientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (ingredient: Ingredient) => void;
  ingredients: string[];
}

export function IngredientDialog({
  isOpen,
  onClose,
  onAdd,
  ingredients,
}: IngredientDialogProps) {
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [customIngredient, setCustomIngredient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIngredient("");
      setCustomIngredient("");
      setAmount("");
      setIsCustom(false);
    }
  }, [isOpen]);

  const handleIngredientChange = (value: string) => {
    if (value === "custom") {
      setIsCustom(true);
      setSelectedIngredient("");
    } else {
      setIsCustom(false);
      setSelectedIngredient(value);
      setCustomIngredient("");
    }
  };

  const handleSubmit = () => {
    const ingredientName = isCustom ? customIngredient : selectedIngredient;
    const amountValue = Number.parseFloat(amount);

    if (ingredientName && amountValue && !isNaN(amountValue)) {
      onAdd({
        name: ingredientName,
        amount: amountValue,
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Ingredient</DialogTitle>
          <DialogDescription>
            Add an ingredient and its amount to this product.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="ingredient-select">Select Ingredient</Label>
            <Select onValueChange={handleIngredientChange}>
              <SelectTrigger id="ingredient-select">
                <SelectValue placeholder="Choose ingredient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">+ Create new ingredient</SelectItem>
                {ingredients.map((ingredient) => (
                  <SelectItem key={ingredient} value={ingredient}>
                    {ingredient}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isCustom && (
            <div className="grid gap-2">
              <Label htmlFor="custom-ingredient">Custom Ingredient Name</Label>
              <Input
                id="custom-ingredient"
                value={customIngredient}
                onChange={(e) => setCustomIngredient(e.target.value)}
                placeholder="Enter custom ingredient name"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="ingredient-amount">Amount (mg)</Label>
            <Input
              id="ingredient-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in mg"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
