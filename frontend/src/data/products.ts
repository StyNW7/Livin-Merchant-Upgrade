import type { Category, Ingredient, Product, ProductAddon, ProductCategory, ProductVariant } from "@/types";

export const PRODUCT_CATEGORIES: ProductCategory[] = ["Coffee", "Non-Coffee", "Food", "Snacks"];

export const categories: Category[] = [
  { id: "Coffee", description: "Espresso-based and manual brew" },
  { id: "Non-Coffee", description: "Tea, matcha, chocolate and water" },
  { id: "Food", description: "Pastry, sandwich and rice bowl" },
  { id: "Snacks", description: "Side dishes and sweet bites" },
];

export const categoryTone: Record<ProductCategory, { bg: string; fg: string }> = {
  Coffee: { bg: "#F3E9DD", fg: "#7A4B1E" },
  "Non-Coffee": { bg: "#E4F4EA", fg: "#1F7A47" },
  Food: { bg: "#FFF2CC", fg: "#805B00" },
  Snacks: { bg: "#DDEAFE", fg: "#255BB3" },
};

/** Drink sizes. Regular is the catalog price. */
export const DRINK_VARIANTS: ProductVariant[] = [
  { id: "regular", label: "Regular", priceDelta: 0 },
  { id: "large", label: "Large", priceDelta: 5_000 },
];

export const DRINK_ADDONS: ProductAddon[] = [
  { id: "extra-shot", label: "Extra shot", price: 5_000 },
  { id: "oat-milk", label: "Oat milk", price: 8_000 },
  { id: "less-sugar", label: "Less sugar", price: 0 },
  { id: "extra-ice", label: "Extra ice", price: 0 },
];

export const FOOD_ADDONS: ProductAddon[] = [
  { id: "extra-cheese", label: "Extra cheese", price: 6_000 },
  { id: "extra-sambal", label: "Extra sambal", price: 3_000 },
];

export function addonsFor(product: Product): ProductAddon[] {
  if (!product.hasAddons) return [];
  return product.category === "Coffee" || product.category === "Non-Coffee" ? DRINK_ADDONS : FOOD_ADDONS;
}

export const initialProducts: Product[] = [
  { id: "p-americano", name: "Americano", category: "Coffee", price: 25_000, costPrice: 7_500, stock: 86, lowStockThreshold: 20, sku: "CF-001", active: true, popularity: 13, hasVariants: true, hasAddons: true },
  { id: "p-cafe-latte", name: "Cafe Latte", category: "Coffee", price: 32_000, costPrice: 10_500, stock: 64, lowStockThreshold: 20, sku: "CF-002", active: true, popularity: 16, hasVariants: true, hasAddons: true },
  { id: "p-caramel-latte", name: "Caramel Latte", category: "Coffee", price: 38_000, costPrice: 12_800, stock: 47, lowStockThreshold: 15, sku: "CF-003", active: true, popularity: 8, hasVariants: true, hasAddons: true },
  { id: "p-kopi-susu", name: "Kopi Susu Gula Aren", category: "Coffee", price: 28_000, costPrice: 8_900, stock: 92, lowStockThreshold: 20, sku: "CF-004", active: true, popularity: 15, hasVariants: true, hasAddons: true },
  { id: "p-cappuccino", name: "Cappuccino", category: "Coffee", price: 33_000, costPrice: 10_700, stock: 58, lowStockThreshold: 15, sku: "CF-005", active: true, popularity: 6, hasVariants: true, hasAddons: true },
  { id: "p-espresso", name: "Espresso", category: "Coffee", price: 20_000, costPrice: 5_600, stock: 70, lowStockThreshold: 15, sku: "CF-006", active: true, popularity: 3, hasAddons: true },
  { id: "p-extra-shot", name: "Extra Espresso Shot", category: "Coffee", price: 5_000, costPrice: 1_900, stock: 120, lowStockThreshold: 25, sku: "CF-007", active: true, popularity: 2 },
  { id: "p-matcha-latte", name: "Matcha Latte", category: "Non-Coffee", price: 35_000, costPrice: 12_200, stock: 41, lowStockThreshold: 15, sku: "NC-001", active: true, popularity: 7, hasVariants: true, hasAddons: true },
  { id: "p-chocolate", name: "Signature Chocolate", category: "Non-Coffee", price: 30_000, costPrice: 10_100, stock: 38, lowStockThreshold: 15, sku: "NC-002", active: true, popularity: 3, hasVariants: true, hasAddons: true },
  { id: "p-lychee-tea", name: "Lychee Tea", category: "Non-Coffee", price: 24_000, costPrice: 6_800, stock: 44, lowStockThreshold: 15, sku: "NC-003", active: true, popularity: 3, hasVariants: true },
  { id: "p-mineral-water", name: "Mineral Water", category: "Non-Coffee", price: 8_000, costPrice: 3_200, stock: 96, lowStockThreshold: 24, sku: "NC-004", active: true, popularity: 2 },
  { id: "p-croissant", name: "Croissant", category: "Food", price: 24_000, costPrice: 11_000, stock: 18, lowStockThreshold: 20, sku: "FD-001", active: true, popularity: 6 },
  { id: "p-chicken-sandwich", name: "Chicken Sandwich", category: "Food", price: 42_000, costPrice: 17_500, stock: 12, lowStockThreshold: 15, sku: "FD-002", active: true, popularity: 5, hasAddons: true },
  { id: "p-rice-bowl", name: "Rice Bowl Sambal Matah", category: "Food", price: 45_000, costPrice: 18_600, stock: 26, lowStockThreshold: 10, sku: "FD-003", active: true, popularity: 3, hasAddons: true },
  { id: "p-french-fries", name: "French Fries", category: "Snacks", price: 28_000, costPrice: 8_400, stock: 34, lowStockThreshold: 10, sku: "SN-001", active: true, popularity: 4, hasAddons: true },
  { id: "p-pisang-goreng", name: "Pisang Goreng Keju", category: "Snacks", price: 22_000, costPrice: 7_100, stock: 29, lowStockThreshold: 10, sku: "SN-002", active: true, popularity: 3 },
  { id: "p-donut", name: "Glazed Donut", category: "Snacks", price: 18_000, costPrice: 7_400, stock: 24, lowStockThreshold: 10, sku: "SN-003", active: true, popularity: 3 },
  { id: "p-cookies", name: "Butter Cookies", category: "Snacks", price: 15_000, costPrice: 5_200, stock: 40, lowStockThreshold: 10, sku: "SN-004", active: true, popularity: 2 },
];

export const productById = new Map(initialProducts.map((p) => [p.id, p]));

export const DEFAULT_FAVORITES = ["p-cafe-latte", "p-kopi-susu", "p-americano", "p-croissant"];

export const initialIngredients: Ingredient[] = [
  { id: "i-beans", name: "Coffee Beans (House Blend)", unit: "kg", stock: 7.5, reorderLevel: 5, dailyUsage: 1.6, costPerUnit: 285_000, supplierId: "sup-rasa" },
  { id: "i-milk", name: "Fresh Milk", unit: "L", stock: 9, reorderLevel: 15, dailyUsage: 8.4, costPerUnit: 25_000, supplierId: "sup-susu" },
  { id: "i-palm-sugar", name: "Palm Sugar Syrup", unit: "L", stock: 6, reorderLevel: 3, dailyUsage: 0.9, costPerUnit: 38_000, supplierId: "sup-rasa" },
  { id: "i-matcha", name: "Matcha Powder", unit: "kg", stock: 1.2, reorderLevel: 0.8, dailyUsage: 0.12, costPerUnit: 420_000, supplierId: "sup-rasa" },
  { id: "i-cups", name: "Cups 16oz with Lid", unit: "pcs", stock: 640, reorderLevel: 300, dailyUsage: 58, costPerUnit: 2_500, supplierId: "sup-kemasan" },
  { id: "i-oat", name: "Oat Milk", unit: "L", stock: 12, reorderLevel: 6, dailyUsage: 1.1, costPerUnit: 46_000, supplierId: "sup-susu" },
];
