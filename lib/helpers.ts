import { Product } from "./product-service";

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const makeCalculations = (product: Product): void => {
  if (product.type === "proteine" || product.type === "weight_gainer") {
    if (product.protein_per_100g && product.ammount && product.price) {
      const proteinAmount = Number.parseFloat(product.protein_per_100g);
      const totalAmount = Number.parseFloat(product.ammount);
      const price = Number.parseFloat(product.price.toString());

      const totalProtein = (proteinAmount * totalAmount) / 100;
      const pricePerProtein = (price / totalProtein) * 100;

      product.price_for_element_gram = pricePerProtein.toFixed(2);
    }
  } else if (product.type === "creatine") {
    if (product.creatine_per_100g && product.ammount && product.price) {
      const creatineAmount = Number.parseFloat(product.creatine_per_100g);
      const totalAmount = Number.parseFloat(product.ammount);
      const price = Number.parseFloat(product.price.toString());

      const totalCreatine = (creatineAmount * totalAmount) / 100;
      const pricePerCreatine = (price / totalCreatine) * 100;

      product.price_for_element_gram = pricePerCreatine.toFixed(2);
    }
  }

  if (product.type === "weight_gainer" && product.calories_per_100g && product.ammount && product.price) {
    const caloriesAmount = Number.parseFloat(product.calories_per_100g);
    const totalAmount = Number.parseFloat(product.ammount);
    const price = Number.parseFloat(product.price.toString());

    const totalCalories = (caloriesAmount * totalAmount) / 100;
    const pricePerCalories = (price / totalCalories) * 100;

    product.price_per_100_calories = pricePerCalories.toFixed(2);
  }
  if (product.type == "preworkout" && product.dose && product.ammount && product.price) {
    const dose = Number.parseFloat(product.dose);
    const totalAmount = Number.parseFloat(product.ammount);
    const price = Number.parseFloat(product.price.toString());
    const totalDoses = totalAmount / dose;
    const pricePerDose = price / totalDoses;
    product.price_per_dose = pricePerDose.toFixed(2);
  }
};
