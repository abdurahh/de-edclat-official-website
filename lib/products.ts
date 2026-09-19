import { createClient } from "@/lib/supabase/server";
import type {
  GemstoneColor,
  JewelryType,
  Product,
  ProductCategory
} from "@/lib/types/product";

function mapConfidential(row: Record<string, unknown>) {
  const confidential = row.product_confidential as
    | {
        cost?: number | string | null;
        source_name?: string | null;
        source_link?: string | null;
      }
    | {
        cost?: number | string | null;
        source_name?: string | null;
        source_link?: string | null;
      }[]
    | null
    | undefined;
  const conf = Array.isArray(confidential)
    ? (confidential[0] ?? null)
    : confidential;

  return {
    cost:
      conf?.cost === null || conf?.cost === undefined
        ? null
        : Number(conf.cost),
    source_name: conf?.source_name ?? null,
    source_link: conf?.source_link ?? null
  };
}

function mapProduct(
  row: Record<string, unknown>,
  includeConfidential = false
): Product {
  const jewelryType = row.jewelry_types as
    | { name?: string; serial_prefix?: string }
    | { name?: string; serial_prefix?: string }[]
    | null
    | undefined;
  const jewelryTypeRow = Array.isArray(jewelryType)
    ? (jewelryType[0] ?? null)
    : jewelryType;

  const gemstoneColor = row.gemstone_colors as
    | { name?: string; serial_prefix?: string }
    | { name?: string; serial_prefix?: string }[]
    | null
    | undefined;
  const gemstoneColorRow = Array.isArray(gemstoneColor)
    ? (gemstoneColor[0] ?? null)
    : gemstoneColor;

  const confidential = includeConfidential
    ? mapConfidential(row)
    : { cost: null, source_name: null, source_link: null };

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
    jewelry_type_id: (row.jewelry_type_id as string | null) ?? null,
    jewelry_type_name: jewelryTypeRow?.name ?? null,
    gemstone_color_id: (row.gemstone_color_id as string | null) ?? null,
    gemstone_color_name: gemstoneColorRow?.name ?? null,
    serial_number: (row.serial_number as string) ?? "",
    ...(includeConfidential ? confidential : {}),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string
  };
}

function mapJewelryType(row: Record<string, unknown>): JewelryType {
  return {
    id: row.id as string,
    name: row.name as string,
    serial_prefix: (row.serial_prefix as string) ?? "",
    created_at: row.created_at as string,
    updated_at: row.updated_at as string
  };
}

function mapGemstoneColor(row: Record<string, unknown>): GemstoneColor {
  return {
    id: row.id as string,
    name: row.name as string,
    serial_prefix: (row.serial_prefix as string) ?? "",
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
    .select(
      "*, jewelry_types(name, serial_prefix), gemstone_colors(name, serial_prefix)"
    )
    .eq("category", category)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch products:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapProduct(row));
}

export async function getActiveProductById(
  id: string
): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, jewelry_types(name, serial_prefix), gemstone_colors(name, serial_prefix)"
    )
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
    .select(
      "*, jewelry_types(name, serial_prefix), gemstone_colors(name, serial_prefix), product_confidential(cost, source_name, source_link)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch admin products:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapProduct(row, true));
}

export async function getJewelryTypes(): Promise<JewelryType[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jewelry_types")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch jewelry types:", error.message);
    return [];
  }

  return (data ?? []).map(mapJewelryType);
}

export async function getGemstoneColors(): Promise<GemstoneColor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gemstone_colors")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch gemstone colors:", error.message);
    return [];
  }

  return (data ?? []).map(mapGemstoneColor);
}
