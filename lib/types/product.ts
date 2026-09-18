export type ProductCategory = "watch" | "jewelry";

export type StockStatus = "available" | "reserved" | "sold";

export type WatchDetails = {
  movement?: string;
  case_material?: string;
  case_diameter?: string;
  strap_bracelet_material?: string;
  water_resistance?: string;
  reference_number?: string;
  year?: string;
  box_and_papers?: string;
};

/** One stone/diamond entry on a jewelry piece. */
export type JewelryStone = {
  name: string;
  size?: string;
  /** Optional count / piece number. */
  quantity?: string;
};

export type JewelryDetails = {
  /** Metal / piece weight (e.g. "Gold · 7g", "18K · 12.4ct"). */
  weight?: string;
  /** @deprecated Prefer `weight`. Kept for older products. */
  material?: string;
  /** @deprecated Prefer `stones`. Kept for older products. */
  gemstones?: string;
  stones?: JewelryStone[];
  /** @deprecated Prefer `weight`. Kept for older products. */
  carat_weight?: string;
  size_dimensions?: string;
  hallmark?: string;
};

export type ProductDetails = WatchDetails & JewelryDetails;

export type Product = {
  id: string;
  category: ProductCategory;
  name: string;
  brand: string;
  price: number;
  currency: string;
  description: string | null;
  condition: string | null;
  stock_status: StockStatus;
  images: string[];
  is_active: boolean;
  details: ProductDetails;
  created_at: string;
  updated_at: string;
};

export const WATCH_DETAIL_FIELDS = [
  { key: "reference_number", label: "Reference" },
  { key: "movement", label: "Movement" },
  { key: "case_material", label: "Case material" },
  { key: "case_diameter", label: "Case diameter" },
  { key: "strap_bracelet_material", label: "Strap / bracelet" },
  { key: "water_resistance", label: "Water resistance" },
  { key: "year", label: "Year" },
  { key: "box_and_papers", label: "Box & papers" }
] as const satisfies ReadonlyArray<{
  key: keyof WatchDetails;
  label: string;
}>;

export const JEWELRY_DETAIL_FIELDS = [
  { key: "weight", label: "Weight" },
  { key: "size_dimensions", label: "Size / dimensions" },
  { key: "hallmark", label: "Hallmark" }
] as const satisfies ReadonlyArray<{
  key: keyof JewelryDetails;
  label: string;
}>;

/** Prefer `weight`; fall back to legacy material + carat_weight. */
export function formatJewelryWeight(details: ProductDetails): string {
  if (details.weight?.trim()) return details.weight.trim();
  return [details.material?.trim(), details.carat_weight?.trim()]
    .filter(Boolean)
    .join(" · ");
}

export function emptyJewelryStone(): JewelryStone {
  return { name: "", size: "", quantity: "" };
}

/** Prefer structured `stones`; fall back to legacy `gemstones` string. */
export function getJewelryStones(details: ProductDetails): JewelryStone[] {
  if (Array.isArray(details.stones) && details.stones.length > 0) {
    return details.stones;
  }
  if (details.gemstones?.trim()) {
    return [{ name: details.gemstones.trim() }];
  }
  return [];
}

export function formatJewelryStone(stone: JewelryStone): string {
  const parts = [stone.name.trim()];
  if (stone.size?.trim()) parts.push(stone.size.trim());
  if (stone.quantity?.trim()) parts.push(`×${stone.quantity.trim()}`);
  return parts.filter(Boolean).join(" · ");
}

export function formatPrice(price: number, currency = "HKD") {
  return new Intl.NumberFormat("en-HK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(price);
}

export function stockLabel(status: StockStatus) {
  switch (status) {
    case "available":
      return "Available";
    case "reserved":
      return "Reserved";
    case "sold":
      return "Sold";
  }
}
