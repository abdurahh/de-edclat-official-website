export type ProductCategory = "watch" | "jewelry" | "diamond" | "gemstone";

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

export type DiamondDetails = {
  carat?: string;
  cut?: string;
  clarity?: string;
  colour?: string;
  certification?: string;
  shape?: string;
};

export type GemstoneDetails = {
  /** Country / region of origin. */
  country_of_origin?: string;
  weight?: string;
  size_dimensions?: string;
  certification?: string;
};

export type ProductDetails = WatchDetails &
  JewelryDetails &
  DiamondDetails &
  GemstoneDetails;

/** Catalog subtype for jewelry (Ring, Necklace, …). Unique by name. */
export type JewelryType = {
  id: string;
  name: string;
  /** Letter code used in serials (R, NE, …). Watches always use W. */
  serial_prefix: string;
  created_at: string;
  updated_at: string;
};

/** Gemstone colour catalog. Serial prefix = first two letters of the colour. */
export type GemstoneColor = {
  id: string;
  name: string;
  serial_prefix: string;
  created_at: string;
  updated_at: string;
};

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
  /** Set when category is jewelry; null otherwise. */
  jewelry_type_id: string | null;
  /** Joined name when loaded with jewelry_types relation. */
  jewelry_type_name?: string | null;
  /** Set when category is gemstone; null otherwise. */
  gemstone_color_id: string | null;
  /** Joined colour name when loaded with gemstone_colors relation. */
  gemstone_color_name?: string | null;
  /** Auto serial e.g. R260001 / W260001 / D260001 / BL260001. */
  serial_number: string;
  /** Admin-only. Never shown on the public site. */
  cost?: number | null;
  /** Admin-only source / supplier name. */
  source_name?: string | null;
  /** Admin-only source URL. */
  source_link?: string | null;
  created_at: string;
  updated_at: string;
};

export const WATCH_SERIAL_PREFIX = "W";
export const DIAMOND_SERIAL_PREFIX = "D";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  watch: "Watch",
  jewelry: "Jewelry",
  diamond: "Diamonds",
  gemstone: "Gemstones"
};

export function resolveSerialPrefix(
  category: ProductCategory,
  jewelryType?: Pick<JewelryType, "serial_prefix"> | null,
  gemstoneColor?: Pick<GemstoneColor, "serial_prefix"> | null
): string | null {
  if (category === "watch") return WATCH_SERIAL_PREFIX;
  if (category === "diamond") return DIAMOND_SERIAL_PREFIX;
  if (category === "jewelry") {
    return jewelryType?.serial_prefix?.toUpperCase() ?? null;
  }
  if (category === "gemstone") {
    return gemstoneColor?.serial_prefix?.toUpperCase() ?? null;
  }
  return null;
}

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

export const DIAMOND_DETAIL_FIELDS = [
  { key: "carat", label: "Carat" },
  { key: "cut", label: "Cut" },
  { key: "clarity", label: "Clarity" },
  { key: "colour", label: "Colour" },
  { key: "shape", label: "Shape" },
  { key: "certification", label: "Certification" }
] as const satisfies ReadonlyArray<{
  key: keyof DiamondDetails;
  label: string;
}>;

export const GEMSTONE_DETAIL_FIELDS = [
  { key: "country_of_origin", label: "Country of origin" },
  { key: "weight", label: "Weight" },
  { key: "size_dimensions", label: "Size / dimensions" },
  { key: "certification", label: "Certification" }
] as const satisfies ReadonlyArray<{
  key: keyof GemstoneDetails;
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

export function detailFieldsForCategory(category: ProductCategory) {
  switch (category) {
    case "watch":
      return WATCH_DETAIL_FIELDS;
    case "jewelry":
      return JEWELRY_DETAIL_FIELDS;
    case "diamond":
      return DIAMOND_DETAIL_FIELDS;
    case "gemstone":
      return GEMSTONE_DETAIL_FIELDS;
  }
}
