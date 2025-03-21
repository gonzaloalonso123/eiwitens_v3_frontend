"use client";

import { getProducts } from "@/lib/product-service";
import { useEffect, useState } from "react";

export const useIngredients = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);

  useEffect(() => {
    getProducts().then((products) => {
      const allIngredients = products.flatMap((product) => product.ingredients);
      const uniqueIngredients = Array.from(new Set(allIngredients));
      setIngredients(uniqueIngredients);
    });
  }, []);
  return ingredients;
};
