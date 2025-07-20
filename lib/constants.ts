import { v4 as uuidv4 } from "uuid";

export const productTypes = [
  { value: "proteine", label: "Protein" },
  { value: "creatine", label: "Creatine" },
  { value: "weight_gainer", label: "Weight Gainer" },
  { value: "preworkout", label: "Pre-workout" },
  { value: "preworkout_ingredient", label: "Pre-workout Ingredients" },
  { value: "vitamins", label: "Vitamins" },
  { value: "other", label: "Other" },
];

export const productSubtypes: Record<string, { value: string; label: string }[]> = {
  proteine: [
    { label: "Whey Proteïne", value: "whey_proteine" },
    { label: "Whey Isolate", value: "whey_isolate" },
    { label: "Vegan Proteïne", value: "vegan_proteine" },
    { label: "Clear whey", value: "clear_whey" },
    { label: "Collageen Eiwit", value: "collagen_protein" },
    { label: "Ei Eiwit", value: "egg_protein" },
    { label: "Beef Proteïne", value: "beef_protein" },
    { label: "Caseïne", value: "caseine" },
    { label: "Biologische eiwitpoeder", value: "organic_protein" },
    { label: "Paleo eiwitpoeder", value: "paleo_protein" },
    { label: "Eiwitpoeder Zonder Zoetstof", value: "unsweetened_protein" },
    { label: "Proteïne Milkshake", value: "proteine_milkshake" },
    { label: "Lactosevrij proteïne poeder", value: "lactose_free_protein" },
    { label: "Diet Whey", value: "diet_whey" },
    { label: "Protein Coffee", value: "protein_coffee" },
    { label: "Whey Hydro", value: "whey_hydro" },
    { label: "Whey Concentraat", value: "whey_concentrate" },
    { label: "Collageen eiwit", value: "collageen_eiwit" },
    { label: "PeptoPro", value: "pepto_pro" },
  ],
  creatine: [
    { value: "monohydrate", label: "Monohydrate" },
    { value: "hcl", label: "HCL" },
    { value: "blend", label: "Blend" },
    { value: "creapure", label: "Creapure" },
    { value: "kre_alkalyn", label: "Kre-Alkalyn" },
    { value: "ethyl_ester", label: "Ethyl Ester" },
  ],
  weight_gainer: [
    { value: "high_calorie", label: "High Calorie" },
    { value: "low_sugar", label: "Low Sugar" },
  ],
  preworkout: [
    { value: "high_caffeine", label: "High Caffeine" },
    { value: "stimulant_free", label: "Stimulant Free" },
    { value: "caffeine_free", label: "Caffeine Free" },
  ],
  preworkout_ingredient: [
    { value: "beta_alanine", label: "Beta-Alanine" },
    { value: "l_citrulline", label: "L-Citrulline" },
    { value: "tyrosine", label: "Tyrosine" },
    { value: "taurine", label: "Taurine" },
    { value: "caffeine_tablets", label: "Caffeine Tablets" },
  ],
  vitamins: [
    { value: "multivitamin", label: "Multivitamin" },
    { value: "vitamin_d", label: "Vitamin D" },
    { value: "vitamin_c", label: "Vitamin C" },
  ],
};

export const discountTypes = [
  { value: "none", label: "None" },
  { value: "percentage", label: "Percentage" },
  { value: "fixed", label: "Fixed Amount" },
];

export const actionTypes = [
  { value: "click", label: "Click" },
  { value: "select", label: "Select" },
  { value: "wait", label: "Wait" },
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
  discount_type: "none",
  store: "",
  subtypes: [],
  scraper: [defaultAction],
};
