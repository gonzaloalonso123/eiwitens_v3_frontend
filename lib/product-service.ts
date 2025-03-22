import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Product {
  id?: string;
  warning: boolean;
  name: string;
  enabled: boolean;
  enabled_top10: boolean;
  trustpilot_url: string;
  discount_value: string;
  price: number;
  image: string;
  count_clicked: { date: string }[];
  type: string;
  protein_per_100g?: string;
  creatine_per_100g?: string;
  sugar_per_100g?: string;
  calories_per_100g?: string;
  caffeine_per_100g?: string;
  beta_alanine_per_100g?: string;
  citrulline_per_100g?: string;
  tyrosine_per_100g?: string;
  scrape_enabled: boolean;
  discount_code: string;
  ammount: string;
  url: string;
  price_for_element_gram: string;
  discount_type: string;
  trustPilotScore?: number;
  store: string;
  subtypes: string[];
  scraper: ScraperAction[];
  price_history?: PriceHistory[];
  count_top10?: { date: string }[];
  ingredients?: {
    name: string;
    amount: number;
  }[];
}

export interface PriceHistory {
  date: string;
  scrapedData: number;
}

export interface ScraperAction {
  id: string;
  selector: string;
  xpath: string;
  type: string;
  optionText?: string;
}

export interface BrandDiscount {
  id?: string;
  discount_type: string;
  discount_value: string;
  discount_code: string;
}

export const getProducts = async (): Promise<Product[]> => {
  const productsRef = collection(db, "products");
  const querySnapshot = await getDocs(productsRef);
  const products: Product[] = [];
  querySnapshot.forEach((doc) => {
    products.push({ ...doc.data(), id: doc.id } as Product);
  });
  return products;
};

export const getBrandDiscounts = async (): Promise<BrandDiscount[]> => {
  const brandDiscounts = collection(db, "brand_discounts");
  const querySnapshot = await getDocs(brandDiscounts);
  const discounts: BrandDiscount[] = [];
  querySnapshot.forEach((doc) => {
    discounts.push({ ...doc.data(), id: doc.id } as BrandDiscount);
  });
  return discounts;
};

export const createProduct = async (
  product: Omit<Product, "id">
): Promise<void> => {
  const productsRef = collection(db, "products");
  await addDoc(productsRef, product);
};

export const createBrandDiscount = async (
  discount: Omit<BrandDiscount, "id">,
  brand: string
): Promise<void> => {
  await setDoc(doc(db, "brand_discounts", brand), {
    ...discount,
  });
};

export const deleteProduct = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "products", id));
};

export const deleteBrandDiscount = async (brand: string): Promise<void> => {
  await deleteDoc(doc(db, "brand_discounts", brand));
};

export const updateProduct = async (
  id: string,
  product: Partial<Product>
): Promise<void> => {
  const productRef = doc(db, "products", id);
  await updateDoc(productRef, product).catch((error) => {
    console.error("Error updating document: ", error);
  });
  console.log("Document successfully updated!", id);
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const productRef = doc(db, "products", id);
  const docSnap = await getDoc(productRef);
  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id } as Product;
  }
  return null;
};

export const applyDiscountToAllProductsOfStore = async (
  store: string,
  discount_type: string,
  discount_value: string,
  discount_code: string
): Promise<void> => {
  const products = await getProducts();
  products.forEach(async (product) => {
    if (product.store === store && product.id) {
      await updateProduct(product.id, {
        discount_type,
        discount_value,
        discount_code,
      });
    }
  });
  createBrandDiscount({ discount_type, discount_value, discount_code }, store);
};

export const removeDiscountFromAllProductsOfStore = async (
  store: string
): Promise<void> => {
  const products = await getProducts();
  products.forEach(async (product) => {
    if (product.store === store && product.id) {
      await updateProduct(product.id, {
        discount_type: "none", // Changed from empty string to "none"
        discount_value: "",
        discount_code: "",
      });
    }
  });
  deleteBrandDiscount(store);
};

export const migrate = async () => {
  const products = await getProducts();
  products.forEach(async (product) => {
    if (product.subtypes.includes("vegan_protein")) {
      await updateProduct(product.id, {
        subtypes: product.subtypes.map((subtype) =>
          subtype === "vegan_protein" ? "vegan_proteine" : subtype
        ),
      });
    }
  });
};
