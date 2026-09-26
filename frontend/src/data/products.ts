import type { Product, ProductCategory } from "@/types";

export const PRODUCT_CATEGORIES: ProductCategory[] = ["Coffee", "Non-Coffee", "Food", "Snacks"];

export const categoryMeta: Record<ProductCategory, { description: string; tone: string }> = {
  Coffee: { description: "Espresso-based and manual brew", tone: "bg-[#F3E9DD] text-[#7A4B1E]" },
  "Non-Coffee": { description: "Tea, matcha, chocolate and water", tone: "bg-[#E4F4EA] text-[#1F7A47]" },
  Food: { description: "Pastry, sandwich and rice bowl", tone: "bg-gold-50 text-gold-800" },
  Snacks: { description: "Side dishes and sweet bites", tone: "bg-sky-50 text-sky-700" },
};

export const initialProducts: Product[] = [
  { id: "p-americano", name: "Americano", category: "Coffee", price: 25_000, stock: 86, lowStockThreshold: 20, sku: "CF-001", active: true, popularity: 13 },
  { id: "p-cafe-latte", name: "Cafe Latte", category: "Coffee", price: 32_000, stock: 64, lowStockThreshold: 20, sku: "CF-002", active: true, popularity: 16 },
  { id: "p-caramel-latte", name: "Caramel Latte", category: "Coffee", price: 38_000, stock: 47, lowStockThreshold: 15, sku: "CF-003", active: true, popularity: 8 },
  { id: "p-kopi-susu", name: "Kopi Susu Gula Aren", category: "Coffee", price: 28_000, stock: 92, lowStockThreshold: 20, sku: "CF-004", active: true, popularity: 15 },
  { id: "p-cappuccino", name: "Cappuccino", category: "Coffee", price: 33_000, stock: 58, lowStockThreshold: 15, sku: "CF-005", active: true, popularity: 6 },
  { id: "p-espresso", name: "Espresso", category: "Coffee", price: 20_000, stock: 70, lowStockThreshold: 15, sku: "CF-006", active: true, popularity: 3 },
  { id: "p-extra-shot", name: "Extra Espresso Shot", category: "Coffee", price: 5_000, stock: 120, lowStockThreshold: 25, sku: "CF-007", active: true, popularity: 2 },
  { id: "p-matcha-latte", name: "Matcha Latte", category: "Non-Coffee", price: 35_000, stock: 41, lowStockThreshold: 15, sku: "NC-001", active: true, popularity: 7 },
  { id: "p-chocolate", name: "Signature Chocolate", category: "Non-Coffee", price: 30_000, stock: 38, lowStockThreshold: 15, sku: "NC-002", active: true, popularity: 3 },
  { id: "p-lychee-tea", name: "Lychee Tea", category: "Non-Coffee", price: 24_000, stock: 44, lowStockThreshold: 15, sku: "NC-003", active: true, popularity: 3 },
  { id: "p-mineral-water", name: "Mineral Water", category: "Non-Coffee", price: 8_000, stock: 96, lowStockThreshold: 24, sku: "NC-004", active: true, popularity: 2 },
  { id: "p-croissant", name: "Croissant", category: "Food", price: 24_000, stock: 18, lowStockThreshold: 20, sku: "FD-001", active: true, popularity: 6 },
  { id: "p-chicken-sandwich", name: "Chicken Sandwich", category: "Food", price: 42_000, stock: 12, lowStockThreshold: 10, sku: "FD-002", active: true, popularity: 5 },
  { id: "p-rice-bowl", name: "Rice Bowl Sambal Matah", category: "Food", price: 45_000, stock: 26, lowStockThreshold: 10, sku: "FD-003", active: true, popularity: 3 },
  { id: "p-french-fries", name: "French Fries", category: "Snacks", price: 28_000, stock: 34, lowStockThreshold: 10, sku: "SN-001", active: true, popularity: 4 },
  { id: "p-pisang-goreng", name: "Pisang Goreng Keju", category: "Snacks", price: 22_000, stock: 29, lowStockThreshold: 10, sku: "SN-002", active: true, popularity: 3 },
  { id: "p-donut", name: "Glazed Donut", category: "Snacks", price: 18_000, stock: 24, lowStockThreshold: 10, sku: "SN-003", active: true, popularity: 3 },
  { id: "p-cookies", name: "Butter Cookies", category: "Snacks", price: 15_000, stock: 40, lowStockThreshold: 10, sku: "SN-004", active: true, popularity: 2 },
];

export const productById = new Map(initialProducts.map((p) => [p.id, p]));
