import { v4 as uuidv4 } from "uuid";

export const productTypes = [
  { value: "proteine", label: "Protein" },
  { value: "creatine", label: "Creatine" },
  { value: "weight_gainer", label: "Weight Gainer" },
  { value: "preworkout", label: "Pre-workout" },
  { value: "vitamins", label: "Vitamins" },
  { value: "other", label: "Other" },
];

export const productSubtypes: Record<
  string,
  { value: string; label: string }[]
> = {
  proteine: [
    { value: "whey_protein", label: "Whey Protein" },
    { value: "whey_isolate", label: "Whey Isolate" },
    { value: "casein", label: "Casein" },
    { value: "egg_protein", label: "Egg Protein" },
    { value: "plant_protein", label: "Plant Protein" },
  ],
  creatine: [
    { value: "monohydrate", label: "Monohydrate" },
    { value: "hcl", label: "HCL" },
    { value: "blend", label: "Blend" },
  ],
  weight_gainer: [
    { value: "high_calorie", label: "High Calorie" },
    { value: "low_sugar", label: "Low Sugar" },
  ],
  preworkout: [
    { value: "high_caffeine", label: "High Caffeine" },
    { value: "stimulant_free", label: "Stimulant Free" },
  ],
  vitamins: [
    { value: "multivitamin", label: "Multivitamin" },
    { value: "vitamin_d", label: "Vitamin D" },
    { value: "vitamin_c", label: "Vitamin C" },
  ],
};

// Fix: Changed the empty string value to "none"
export const discountTypes = [
  { value: "none", label: "None" },
  { value: "percentage", label: "Percentage" },
  { value: "fixed", label: "Fixed Amount" },
];

export const actionTypes = [
  { value: "click", label: "Click" },
  { value: "select", label: "Select" },
  { value: "selectOption", label: "Select Option" },
];

export const defaultAction = {
  selector: "xpath",
  type: "click",
  xpath: "",
  id: uuidv4(),
};

export const defaultProduct = {
  warning: false,
  name: "",
  enabled: true,
  enabled_top10: true,
  trustpilot_url: "",
  discount_value: "",
  price: 0,
  image: "",
  count_clicked: [],
  type: "proteine",
  scrape_enabled: true,
  discount_code: "",
  ammount: "",
  url: "",
  price_for_element_gram: "",
  discount_type: "none", // Updated to use "none" instead of empty string
  store: "",
  subtypes: [],
  scraper: [defaultAction],
};
