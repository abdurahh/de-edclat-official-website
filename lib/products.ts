import { createClient } from "@/lib/supabase/server";
import type { Product, ProductCategory } from "@/lib/types/product";

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    category: row.category as ProductCategory,
    name: row.name as string,
    brand: row.brand as string,
    price: Number(row.price),
    currency: (row.currency as string) || "HKD",
    description: (row.description as string | null) ?? null,
    condition: (row.condition as string | null) ?? null,
    stock_status: row.stock_status as Product["stock_status"],
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    is_active: Boolean(row.is_active),
    details: (row.details as Product["details"]) ?? {},
    created_at: row.created_at as string,
    updated_at: row.updated_at as string
  };
}

export async function getActiveProductsByCategory(
  category: ProductCategory
): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch products:", error.message);
    return [];
  }

  return (data ?? []).map(mapProduct);
}

export async function getActiveProductById(
  id: string
): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch product:", error.message);
    return null;
  }

  return data ? mapProduct(data) : null;
}

export async function getAllProductsForAdmin(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch admin products:", error.message);
    return [];
  }

  return (data ?? []).map(mapProduct);
}
