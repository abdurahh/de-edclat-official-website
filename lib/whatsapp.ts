const DEFAULT_WHATSAPP = "85260970143";

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
  category: string;
}) {
  return `Hello De Eclat — I'm interested in the ${product.brand} ${product.name} (${product.category}). Could you share availability and next steps?`;
}
