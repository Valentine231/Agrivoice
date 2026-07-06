"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ProductCategory } from "@/lib/transport";

export async function createProductAction(input: {
  category: ProductCategory;
  cropName: string;
  quantityLabel: string;
  unit: string;
  pricePerUnit: number;
  state: string;
  imageUrl: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "not_authenticated" as const };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "farmer") {
    return { error: "Only farmer accounts can list produce for sale." };
  }

  const { error } = await supabase.from("products").insert({
    farmer_id: user.id,
    category: input.category,
    crop_name: input.cropName,
    quantity_label: input.quantityLabel,
    unit: input.unit || "unit",
    price_per_unit: input.pricePerUnit,
    state: input.state,
    image_url: input.imageUrl,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/buyer/marketplace");
  revalidatePath("/categories");
  revalidatePath("/farmer/dashboard");

  return { success: true as const };
}
