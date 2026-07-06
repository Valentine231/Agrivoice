import { ProductCategory } from "./transport";

export interface Product {
  id: string;
  farmerName: string;
  cropName: string;
  category: ProductCategory;
  quantity: string;
  pricePerUnit: number;
  unit: string;
  state: string;
  imageUrl: string;
  postedAt: string;
}

// In production, this list is fetched from your database (product rows store
// the Cloudinary secure_url returned after upload — see app/api/cloudinary/sign).
// Served through app/api/demo-products so every page (farmer dashboard, buyer
// marketplace, categories) pulls from the exact same sample data instead of
// each having its own hardcoded copy.
export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    farmerName: "Musa Ibrahim",
    cropName: "Fresh Tomatoes",
    category: "perishable",
    quantity: "40 baskets",
    pricePerUnit: 18000,
    unit: "basket",
    state: "Kaduna",
    imageUrl: "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=800",
    postedAt: "2026-06-28",
  },
  {
    id: "p2",
    farmerName: "Ngozi Eze",
    cropName: "Cocoa Beans",
    category: "cashCrop",
    quantity: "12 tons",
    pricePerUnit: 2100000,
    unit: "ton",
    state: "Ondo",
    imageUrl: "https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?w=800",
    postedAt: "2026-06-25",
  },
  {
    id: "p3",
    farmerName: "Aisha Bello",
    cropName: "Maize",
    category: "grain",
    quantity: "80 bags",
    pricePerUnit: 32000,
    unit: "bag (100kg)",
    state: "Niger",
    imageUrl: "https://images.unsplash.com/photo-1601472639107-72e034ab1d75?w=800",
    postedAt: "2026-06-30",
  },
  {
    id: "p4",
    farmerName: "Chinedu Okafor",
    cropName: "Cassava Tubers",
    category: "tuber",
    quantity: "5 tons",
    pricePerUnit: 95000,
    unit: "ton",
    state: "Anambra",
    imageUrl: "https://images.unsplash.com/photo-1591560644665-ceff4a09e18a?w=800",
    postedAt: "2026-06-29",
  },
  {
    id: "p5",
    farmerName: "Tunde Adebayo",
    cropName: "Live Goats",
    category: "livestock",
    quantity: "25 heads",
    pricePerUnit: 65000,
    unit: "goat",
    state: "Oyo",
    imageUrl: "https://images.unsplash.com/photo-1560468660-6c11a19d7330?w=800",
    postedAt: "2026-06-27",
  },
  {
    id: "p6",
    farmerName: "Fatima Suleiman",
    cropName: "Sweet Peppers",
    category: "perishable",
    quantity: "15 baskets",
    pricePerUnit: 22000,
    unit: "basket",
    state: "Kano",
    imageUrl: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800",
    postedAt: "2026-06-30",
  },
  {
    id: "p7",
    farmerName: "Emeka Nwosu",
    cropName: "Groundnuts",
    category: "cashCrop",
    quantity: "30 bags",
    pricePerUnit: 45000,
    unit: "bag (50kg)",
    state: "Kano",
    imageUrl: "https://images.unsplash.com/photo-1567892737950-30c478c9b7a3?w=800",
    postedAt: "2026-06-26",
  },
  {
    id: "p8",
    farmerName: "Blessing Udo",
    cropName: "Rice (Paddy)",
    category: "grain",
    quantity: "60 bags",
    pricePerUnit: 38000,
    unit: "bag (100kg)",
    state: "Rivers",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800",
    postedAt: "2026-07-01",
  },
  {
    id: "p9",
    farmerName: "Ibrahim Sani",
    cropName: "Yam Tubers",
    category: "tuber",
    quantity: "8 tons",
    pricePerUnit: 210000,
    unit: "ton",
    state: "Niger",
    imageUrl: "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=800",
    postedAt: "2026-06-24",
  },
  {
    id: "p10",
    farmerName: "Grace Ohaeri",
    cropName: "Layer Chickens",
    category: "livestock",
    quantity: "150 birds",
    pricePerUnit: 4500,
    unit: "bird",
    state: "Enugu",
    imageUrl: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800",
    postedAt: "2026-06-22",
  },
  {
    id: "p11",
    farmerName: "Yusuf Aliyu",
    cropName: "Onions",
    category: "perishable",
    quantity: "50 sacks",
    pricePerUnit: 25000,
    unit: "sack",
    state: "Kaduna",
    imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800",
    postedAt: "2026-07-02",
  },
  {
    id: "p12",
    farmerName: "Chidinma Obi",
    cropName: "Sesame Seeds",
    category: "cashCrop",
    quantity: "10 tons",
    pricePerUnit: 850000,
    unit: "ton",
    state: "Abuja",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
    postedAt: "2026-06-23",
  },
];

// Approximate state capital coordinates, used for the transport distance estimate.
export const STATE_COORDS: Record<string, { lat: number; lng: number }> = {
  Kaduna: { lat: 10.5222, lng: 7.4383 },
  Ondo: { lat: 7.2508, lng: 5.1931 },
  Niger: { lat: 9.9309, lng: 5.5983 },
  Anambra: { lat: 6.2209, lng: 7.0721 },
  Oyo: { lat: 8.1574, lng: 3.6147 },
  Kano: { lat: 12.0022, lng: 8.5920 },
  Lagos: { lat: 6.5244, lng: 3.3792 },
  Rivers: { lat: 4.8156, lng: 7.0498 },
  Enugu: { lat: 6.4413, lng: 7.4988 },
  Abuja: { lat: 9.0765, lng: 7.3986 },
};

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  cashCrop: "Cash Crops",
  perishable: "Perishables",
  grain: "Grains",
  livestock: "Livestock",
  tuber: "Tubers & Roots",
};
