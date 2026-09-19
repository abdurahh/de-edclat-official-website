import { CATEGORY_LABELS, type ProductCategory } from "@/lib/types/product";

const DEFAULT_WHATSAPP = "85261426130";

export function getWhatsAppNumber() {
  return (
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ||
    DEFAULT_WHATSAPP
  );
}

export function buildWhatsAppUrl(message: string) {
  const number = getWhatsAppNumber();
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function productInquiryMessage(product: {
  brand: string;
  name: string;
  category: ProductCategory | string;
  serial_number: string;
}) {
  const categoryLabel =
    product.category in CATEGORY_LABELS
      ? CATEGORY_LABELS[product.category as ProductCategory]
      : product.category;
  const serial = product.serial_number?.trim();

  return `Hello De Eclat — I'm interested in the ${product.brand} ${product.name}${
    serial ? ` (Serial: ${serial})` : ""
  } from your ${categoryLabel} collection. Could you share availability and next steps?`;
}
