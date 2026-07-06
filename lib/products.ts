import { createClient } from "@/lib/supabase/client";
import { Product } from "@/lib/mockData";
import { ProductRow } from "@/lib/database.types";

type RowWithFarmer = ProductRow & { profiles: { full_name: string } | null };

function mapRow(row: RowWithFarmer): Product {
  return {
    id: row.id,
    farmerName: row.profiles?.full_name ?? "AgriLink Farmer",
    cropName: row.crop_name,
    category: row.category,
    quantity: row.quantity_label,
    pricePerUnit: Number(row.price_per_unit),
    unit: row.unit,
    state: row.state,
    imageUrl: row.image_url || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800",
    postedAt: row.created_at,
  };
}

export async function fetchActiveProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, profiles(full_name)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as RowWithFarmer[]).map(mapRow);
}

export async function fetchProductById(id: string): Promise<{ product: Product; farmerId: string } | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, profiles(full_name)")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  const row = data as unknown as RowWithFarmer;
  return { product: mapRow(row), farmerId: row.farmer_id };
}

export async function fetchDemoProducts(): Promise<Product[]> {
  const res = await fetch("/api/demo-products");
  if (!res.ok) throw new Error("Could not load sample listings");
  const data = await res.json();
  return data.products as Product[];
}

export async function fetchMyProducts(farmerId: string): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, profiles(full_name)")
    .eq("farmer_id", farmerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as RowWithFarmer[]).map(mapRow);
}
