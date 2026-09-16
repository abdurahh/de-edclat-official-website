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

export type JewelryDetails = {
  material?: string;
  gemstones?: string;
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
  { key: "material", label: "Material / metal" },
  { key: "gemstones", label: "Gemstone(s)" },
  { key: "carat_weight", label: "Carat weight" },
  { key: "size_dimensions", label: "Size / dimensions" },
  { key: "hallmark", label: "Hallmark" }
] as const satisfies ReadonlyArray<{
  key: keyof JewelryDetails;
  label: string;
}>;

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
