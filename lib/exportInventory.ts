import * as XLSX from "xlsx";
import {
  CATEGORY_LABELS,
  formatJewelryStone,
  formatJewelryWeight,
  getJewelryStones,
  stockLabel,
  type Product
} from "@/lib/types/product";

export type InventoryExportKind = "general" | "company";

function detailValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-HK", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function exportStamp() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
    .format(new Date())
    .replaceAll("-", "");
}

function buildGeneralRow(product: Product) {
  const details = product.details ?? {};
  const stones = getJewelryStones(details)
    .map(formatJewelryStone)
    .filter(Boolean)
    .join("; ");

  return {
    "Serial number": product.serial_number,
    Category: CATEGORY_LABELS[product.category] ?? product.category,
    "Jewelry type": product.jewelry_type_name ?? "",
    "Gemstone colour": product.gemstone_color_name ?? "",
    Brand: product.brand,
    Name: product.name,
    Price: product.price,
    Currency: product.currency,
    Condition: product.condition ?? "",
    "Stock status": stockLabel(product.stock_status),
    Active: product.is_active ? "Yes" : "No",
    Reference: detailValue(details.reference_number),
    Movement: detailValue(details.movement),
    "Case material": detailValue(details.case_material),
    "Case diameter": detailValue(details.case_diameter),
    "Strap / bracelet": detailValue(details.strap_bracelet_material),
    "Water resistance": detailValue(details.water_resistance),
    Year: detailValue(details.year),
    "Box & papers": detailValue(details.box_and_papers),
    Weight: formatJewelryWeight(details),
    "Size / dimensions": detailValue(details.size_dimensions),
    Hallmark: detailValue(details.hallmark),
    Stones: stones,
    Carat: detailValue(details.carat),
    Cut: detailValue(details.cut),
    Clarity: detailValue(details.clarity),
    Colour: detailValue(details.colour),
    Shape: detailValue(details.shape),
    Certification: detailValue(details.certification),
    "Country of origin": detailValue(details.country_of_origin),
    "Created at": formatDate(product.created_at),
    "Updated at": formatDate(product.updated_at)
  };
}

export function buildInventoryExportRows(
  products: Product[],
  kind: InventoryExportKind = "general"
) {
  return products.map((product) => {
    const row = buildGeneralRow(product);
    if (kind === "company") {
      return {
        ...row,
        Cost: product.cost ?? "",
        "Source name": product.source_name ?? "",
        "Source link": product.source_link ?? ""
      };
    }
    return row;
  });
}

function downloadWorkbook(
  rows: Record<string, string | number>[],
  sheetName: string,
  fileName: string
) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const columnWidths = Object.keys(rows[0] ?? { "Serial number": "" }).map(
    (key) => ({
      wch: Math.min(
        40,
        Math.max(
          key.length + 2,
          ...rows.map((row) => String(row[key] ?? "").length)
        )
      )
    })
  );
  worksheet["!cols"] = columnWidths;

  XLSX.writeFile(workbook, fileName);
}

/** Public / general inventory sheet (includes serial number). */
export function downloadInventoryExcel(products: Product[]) {
  const rows = buildInventoryExportRows(products, "general");
  downloadWorkbook(
    rows,
    "Inventory",
    `de-eclat-inventory-${exportStamp()}.xlsx`
  );
}

/** Company sheet = general columns + cost, source name, source link. */
export function downloadCompanyInventoryExcel(products: Product[]) {
  const rows = buildInventoryExportRows(products, "company");
  downloadWorkbook(
    rows,
    "Company inventory",
    `con-de-eclat-inventory-${exportStamp()}.xlsx`
  );
}
