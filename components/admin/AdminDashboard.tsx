"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { downloadCompanyInventoryExcel, downloadInventoryExcel } from "@/lib/exportInventory";
import {
  CATEGORY_LABELS,
  DIAMOND_SERIAL_PREFIX,
  WATCH_SERIAL_PREFIX,
  detailFieldsForCategory,
  emptyJewelryStone,
  formatJewelryWeight,
  formatPrice,
  getJewelryStones,
  resolveSerialPrefix,
  stockLabel,
  type GemstoneColor,
  type JewelryStone,
  type JewelryType,
  type Product,
  type ProductCategory,
  type ProductDetails,
  type StockStatus
} from "@/lib/types/product";

type AdminDashboardProps = {
  initialProducts: Product[];
  initialJewelryTypes: JewelryType[];
  initialGemstoneColors: GemstoneColor[];
  adminEmail: string;
};

type FormState = {
  category: ProductCategory;
  name: string;
  brand: string;
  price: string;
  description: string;
  condition: string;
  stock_status: StockStatus;
  is_active: boolean;
  jewelry_type_id: string;
  gemstone_color_id: string;
  details: ProductDetails;
  images: string[];
  cost: string;
  source_name: string;
  source_link: string;
};

const emptyForm = (): FormState => ({
  category: "watch",
  name: "",
  brand: "",
  price: "",
  description: "",
  condition: "",
  stock_status: "available",
  is_active: true,
  jewelry_type_id: "",
  gemstone_color_id: "",
  details: {},
  images: [],
  cost: "",
  source_name: "",
  source_link: ""
});

function productToForm(product: Product): FormState {
  const details = { ...(product.details ?? {}) };
  if (product.category === "jewelry") {
    const stones = getJewelryStones(details);
    details.stones = stones.length > 0 ? stones : [emptyJewelryStone()];
    const weight = formatJewelryWeight(details);
    if (weight) details.weight = weight;
    delete details.gemstones;
    delete details.material;
    delete details.carat_weight;
  }
  return {
    category: product.category,
    name: product.name,
    brand: product.brand,
    price: String(product.price),
    description: product.description ?? "",
    condition: product.condition ?? "",
    stock_status: product.stock_status,
    is_active: product.is_active,
    jewelry_type_id: product.jewelry_type_id ?? "",
    gemstone_color_id: product.gemstone_color_id ?? "",
    details,
    images: product.images ?? [],
    cost:
      product.cost === null || product.cost === undefined
        ? ""
        : String(product.cost),
    source_name: product.source_name ?? "",
    source_link: product.source_link ?? ""
  };
}

function normalizeCatalogName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function isDuplicateCatalogError(message: string) {
  return (
    message.includes("jewelry_types_name_unique_idx") ||
    message.includes("gemstone_colors_name_unique_idx") ||
    message.toLowerCase().includes("duplicate")
  );
}

function sanitizeDetails(details: ProductDetails): ProductDetails {
  const next: ProductDetails = {};

  for (const [key, value] of Object.entries(details)) {
    if (
      key === "stones" ||
      key === "gemstones" ||
      key === "material" ||
      key === "carat_weight"
    ) {
      continue;
    }
    if (typeof value === "string" && value.trim().length > 0) {
      (next as Record<string, string>)[key] = value.trim();
    }
  }

  if (Array.isArray(details.stones)) {
    const stones = details.stones
      .map((stone) => ({
        name: stone.name.trim(),
        ...(stone.size?.trim() ? { size: stone.size.trim() } : {}),
        ...(stone.quantity?.trim() ? { quantity: stone.quantity.trim() } : {})
      }))
      .filter((stone) => stone.name.length > 0);
    if (stones.length > 0) next.stones = stones;
  }

  return next;
}

function jewelryStonesFromForm(details: ProductDetails): JewelryStone[] {
  const stones = details.stones;
  if (Array.isArray(stones) && stones.length > 0) return stones;
  return [emptyJewelryStone()];
}

export function AdminDashboard({
  initialProducts,
  initialJewelryTypes,
  initialGemstoneColors,
  adminEmail
}: AdminDashboardProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [jewelryTypes, setJewelryTypes] = useState(initialJewelryTypes);
  const [gemstoneColors, setGemstoneColors] = useState(initialGemstoneColors);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [addingType, setAddingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [savingType, setSavingType] = useState(false);
  const [addingColor, setAddingColor] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [savingColor, setSavingColor] = useState(false);
  const [deletingType, setDeletingType] = useState(false);
  const [deletingColor, setDeletingColor] = useState(false);
  const [serialPreview, setSerialPreview] = useState<string | null>(null);
  const [serialPreviewLoading, setSerialPreviewLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  const detailFields = useMemo(
    () => detailFieldsForCategory(form.category),
    [form.category]
  );

  const selectedJewelryType = useMemo(
    () => jewelryTypes.find((type) => type.id === form.jewelry_type_id) ?? null,
    [jewelryTypes, form.jewelry_type_id]
  );

  const selectedGemstoneColor = useMemo(
    () =>
      gemstoneColors.find((color) => color.id === form.gemstone_color_id) ??
      null,
    [gemstoneColors, form.gemstone_color_id]
  );

  const editingProduct = useMemo(
    () => products.find((product) => product.id === editingId) ?? null,
    [products, editingId]
  );

  const serialPrefix = useMemo(
    () =>
      resolveSerialPrefix(
        form.category,
        selectedJewelryType,
        selectedGemstoneColor
      ),
    [form.category, selectedJewelryType, selectedGemstoneColor]
  );

  useEffect(() => {
    if (editingId) {
      setSerialPreview(editingProduct?.serial_number ?? null);
      setSerialPreviewLoading(false);
      return;
    }

    if (!serialPrefix) {
      setSerialPreview(null);
      setSerialPreviewLoading(false);
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    setSerialPreviewLoading(true);
    void supabase
      .rpc("preview_next_product_serial", { p_prefix: serialPrefix })
      .then(({ data, error: previewError }) => {
        if (cancelled) return;
        if (previewError) {
          setSerialPreview(null);
          setSerialPreviewLoading(false);
          return;
        }
        setSerialPreview(typeof data === "string" ? data : null);
        setSerialPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [editingId, editingProduct?.serial_number, serialPrefix, products]);

  function resetForm() {
    setForm(emptyForm());
    setEditingId(null);
    setAddingType(false);
    setNewTypeName("");
    setAddingColor(false);
    setNewColorName("");
  }

  async function addJewelryType() {
    const name = normalizeCatalogName(newTypeName);
    if (!name) {
      setError("Enter a jewelry type name.");
      return;
    }

    const duplicate = jewelryTypes.some(
      (type) => type.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      setError(`“${name}” already exists. Choose it from the dropdown.`);
      return;
    }

    setSavingType(true);
    setError(null);
    setStatus(null);
    const supabase = createClient();

    try {
      const { data, error: insertError } = await supabase
        .from("jewelry_types")
        .insert({ name })
        .select("*")
        .single();
      if (insertError) throw insertError;

      const created: JewelryType = {
        id: data.id,
        name: data.name,
        serial_prefix: data.serial_prefix,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setJewelryTypes((current) =>
        [...current, created].sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        )
      );
      setForm((current) => ({ ...current, jewelry_type_id: created.id }));
      setAddingType(false);
      setNewTypeName("");
      setStatus(
        `Jewelry type “${created.name}” added (serial prefix ${created.serial_prefix}).`
      );
    } catch (typeErr) {
      const message =
        typeErr instanceof Error ? typeErr.message : "Could not add type.";
      setError(
        isDuplicateCatalogError(message)
          ? `“${name}” already exists. Choose it from the dropdown.`
          : message
      );
    } finally {
      setSavingType(false);
    }
  }

  async function addGemstoneColor() {
    const name = normalizeCatalogName(newColorName);
    if (!name) {
      setError("Enter a gemstone colour name.");
      return;
    }
    if (name.replace(/[^a-zA-Z]/g, "").length < 2) {
      setError("Colour name needs at least two letters for the serial prefix.");
      return;
    }

    const duplicate = gemstoneColors.some(
      (color) => color.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      setError(`“${name}” already exists. Choose it from the dropdown.`);
      return;
    }

    setSavingColor(true);
    setError(null);
    setStatus(null);
    const supabase = createClient();

    try {
      const { data, error: insertError } = await supabase
        .from("gemstone_colors")
        .insert({ name })
        .select("*")
        .single();
      if (insertError) throw insertError;

      const created: GemstoneColor = {
        id: data.id,
        name: data.name,
        serial_prefix: data.serial_prefix,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setGemstoneColors((current) =>
        [...current, created].sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        )
      );
      setForm((current) => ({ ...current, gemstone_color_id: created.id }));
      setAddingColor(false);
      setNewColorName("");
      setStatus(
        `Gemstone colour “${created.name}” added (serial prefix ${created.serial_prefix}).`
      );
    } catch (colorErr) {
      const message =
        colorErr instanceof Error ? colorErr.message : "Could not add colour.";
      setError(
        isDuplicateCatalogError(message)
          ? `“${name}” already exists. Choose it from the dropdown.`
          : message
      );
    } finally {
      setSavingColor(false);
    }
  }

  async function deleteJewelryType() {
    if (!form.jewelry_type_id) {
      setError("Select a jewelry type to delete.");
      return;
    }

    const type = jewelryTypes.find((item) => item.id === form.jewelry_type_id);
    if (!type) return;

    const inUse = products.filter(
      (product) => product.jewelry_type_id === type.id
    ).length;
    const warning =
      inUse > 0
        ? `Delete jewelry type “${type.name}”? It is used by ${inUse} product${inUse === 1 ? "" : "s"}. Those products will keep their serial numbers but lose this type.`
        : `Delete jewelry type “${type.name}”?`;

    if (!window.confirm(warning)) return;

    setDeletingType(true);
    setError(null);
    setStatus(null);
    const supabase = createClient();

    try {
      const { error: deleteError } = await supabase
        .from("jewelry_types")
        .delete()
        .eq("id", type.id);
      if (deleteError) throw deleteError;

      setJewelryTypes((current) =>
        current.filter((item) => item.id !== type.id)
      );
      setProducts((current) =>
        current.map((product) =>
          product.jewelry_type_id === type.id
            ? {
                ...product,
                jewelry_type_id: null,
                jewelry_type_name: null
              }
            : product
        )
      );
      setForm((current) => ({ ...current, jewelry_type_id: "" }));
      setStatus(`Jewelry type “${type.name}” deleted.`);
      router.refresh();
    } catch (deleteErr) {
      setError(
        deleteErr instanceof Error
          ? deleteErr.message
          : "Could not delete jewelry type."
      );
    } finally {
      setDeletingType(false);
    }
  }

  async function deleteGemstoneColor() {
    if (!form.gemstone_color_id) {
      setError("Select a gemstone colour to delete.");
      return;
    }

    const color = gemstoneColors.find(
      (item) => item.id === form.gemstone_color_id
    );
    if (!color) return;

    const inUse = products.filter(
      (product) => product.gemstone_color_id === color.id
    ).length;
    const warning =
      inUse > 0
        ? `Delete colour “${color.name}”? It is used by ${inUse} product${inUse === 1 ? "" : "s"}. Those products will keep their serial numbers but lose this colour.`
        : `Delete colour “${color.name}”?`;

    if (!window.confirm(warning)) return;

    setDeletingColor(true);
    setError(null);
    setStatus(null);
    const supabase = createClient();

    try {
      const { error: deleteError } = await supabase
        .from("gemstone_colors")
        .delete()
        .eq("id", color.id);
      if (deleteError) throw deleteError;

      setGemstoneColors((current) =>
        current.filter((item) => item.id !== color.id)
      );
      setProducts((current) =>
        current.map((product) =>
          product.gemstone_color_id === color.id
            ? {
                ...product,
                gemstone_color_id: null,
                gemstone_color_name: null
              }
            : product
        )
      );
      setForm((current) => ({ ...current, gemstone_color_id: "" }));
      setStatus(`Gemstone colour “${color.name}” deleted.`);
      router.refresh();
    } catch (deleteErr) {
      setError(
        deleteErr instanceof Error
          ? deleteErr.message
          : "Could not delete gemstone colour."
      );
    } finally {
      setDeletingColor(false);
    }
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm(productToForm(product));
    setStatus(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadImages(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const uploaded: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          throw new Error("Only image files are allowed.");
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error("Each image must be under 10MB.");
        }

        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${form.category}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      setForm((current) => ({
        ...current,
        images: [...current.images, ...uploaded]
      }));
    } catch (uploadErr) {
      setError(
        uploadErr instanceof Error ? uploadErr.message : "Image upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setStatus(null);

    const price = Number(form.price);
    if (!form.name.trim() || !form.brand.trim()) {
      setError("Name and brand are required.");
      setSaving(false);
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid price in HKD.");
      setSaving(false);
      return;
    }
    if (form.images.length === 0) {
      setError("Add at least one product image.");
      setSaving(false);
      return;
    }
    if (form.category === "jewelry" && !form.jewelry_type_id) {
      setError("Select a jewelry type, or add a new one.");
      setSaving(false);
      return;
    }
    if (form.category === "gemstone" && !form.gemstone_color_id) {
      setError("Select a gemstone colour, or add a new one.");
      setSaving(false);
      return;
    }

    const costRaw = form.cost.trim();
    const cost = costRaw === "" ? null : Number(costRaw);
    if (costRaw !== "" && (!Number.isFinite(cost) || (cost as number) < 0)) {
      setError("Enter a valid cost, or leave it blank.");
      setSaving(false);
      return;
    }

    const jewelryTypeId =
      form.category === "jewelry" ? form.jewelry_type_id : null;
    const jewelryTypeName = jewelryTypeId
      ? (jewelryTypes.find((type) => type.id === jewelryTypeId)?.name ?? null)
      : null;
    const gemstoneColorId =
      form.category === "gemstone" ? form.gemstone_color_id : null;
    const gemstoneColorName = gemstoneColorId
      ? (gemstoneColors.find((color) => color.id === gemstoneColorId)?.name ??
        null)
      : null;

    const sourceName = form.source_name.trim() || null;
    const sourceLink = form.source_link.trim() || null;

    const payload = {
      category: form.category,
      name: form.name.trim(),
      brand: form.brand.trim(),
      price,
      currency: "HKD",
      description: form.description.trim() || null,
      condition: form.condition.trim() || null,
      stock_status: form.stock_status,
      is_active: form.is_active,
      images: form.images,
      jewelry_type_id: jewelryTypeId,
      gemstone_color_id: gemstoneColorId,
      details: sanitizeDetails(form.details)
    };

    const supabase = createClient();

    async function saveConfidential(productId: string) {
      const hasConfidential =
        cost !== null || sourceName !== null || sourceLink !== null;

      if (!hasConfidential) {
        await supabase
          .from("product_confidential")
          .delete()
          .eq("product_id", productId);
        return;
      }

      const { error: confidentialError } = await supabase
        .from("product_confidential")
        .upsert(
          {
            product_id: productId,
            cost,
            source_name: sourceName,
            source_link: sourceLink
          },
          { onConflict: "product_id" }
        );
      if (confidentialError) throw confidentialError;
    }

    try {
      if (editingId) {
        const { data, error: updateError } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingId)
          .select("*")
          .single();
        if (updateError) throw updateError;
        await saveConfidential(editingId);
        setProducts((current) =>
          current.map((item) =>
            item.id === editingId
              ? {
                  ...item,
                  ...payload,
                  price,
                  description: payload.description,
                  condition: payload.condition,
                  details: payload.details,
                  jewelry_type_id: jewelryTypeId,
                  jewelry_type_name: jewelryTypeName,
                  gemstone_color_id: gemstoneColorId,
                  gemstone_color_name: gemstoneColorName,
                  serial_number: data.serial_number ?? item.serial_number,
                  cost,
                  source_name: sourceName,
                  source_link: sourceLink,
                  updated_at: data.updated_at
                }
              : item
          )
        );
        setStatus("Product updated.");
      } else {
        const { data, error: insertError } = await supabase
          .from("products")
          .insert(payload)
          .select("*")
          .single();
        if (insertError) throw insertError;
        await saveConfidential(data.id);
        setProducts((current) => [
          {
            id: data.id,
            category: data.category,
            name: data.name,
            brand: data.brand,
            price: Number(data.price),
            currency: data.currency,
            description: data.description,
            condition: data.condition,
            stock_status: data.stock_status,
            images: data.images ?? [],
            is_active: data.is_active,
            details: data.details ?? {},
            jewelry_type_id: data.jewelry_type_id ?? jewelryTypeId,
            jewelry_type_name: jewelryTypeName,
            gemstone_color_id: data.gemstone_color_id ?? gemstoneColorId,
            gemstone_color_name: gemstoneColorName,
            serial_number: data.serial_number,
            cost,
            source_name: sourceName,
            source_link: sourceLink,
            created_at: data.created_at,
            updated_at: data.updated_at
          },
          ...current
        ]);
        setStatus(`Product added · ${data.serial_number}`);
      }
      resetForm();
      router.refresh();
    } catch (saveErr) {
      setError(
        saveErr instanceof Error ? saveErr.message : "Could not save product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deactivateProduct(id: string) {
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setProducts((current) =>
      current.map((item) =>
        item.id === id ? { ...item, is_active: false } : item
      )
    );
    setStatus("Product deactivated.");
    router.refresh();
  }

  async function confirmDeleteProduct() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeletingProduct(true);
    setError(null);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    setDeletingProduct(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setDeleteTarget(null);
    setProducts((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setStatus("Product deleted.");
    router.refresh();
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  function exportInventory(kind: "general" | "company") {
    if (products.length === 0) {
      setError("No products to export.");
      return;
    }
    try {
      if (kind === "company") {
        downloadCompanyInventoryExcel(products);
        setStatus(`Exported company inventory (${products.length} products).`);
      } else {
        downloadInventoryExcel(products);
        setStatus(`Exported inventory (${products.length} products).`);
      }
      setError(null);
    } catch (exportErr) {
      setError(
        exportErr instanceof Error
          ? exportErr.message
          : "Could not export inventory."
      );
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="caps-label caps-28 text-xs font-semibold uppercase text-ruby">
            Catalog admin
          </p>
          <h1 className="mt-3 font-display text-4xl text-charcoal sm:text-5xl">
            Products
          </h1>
          <p className="mt-2 text-sm text-slate">Signed in as {adminEmail}</p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="inline-flex items-center justify-center rounded-full border border-ruby/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-ruby transition hover:bg-ruby hover:text-pearl"
        >
          Sign out
        </button>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-[2rem] border border-ruby/10 bg-white/65 p-6 shadow-soft backdrop-blur-xl sm:p-8"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-2xl text-charcoal">
            {editingId ? "Edit product" : "Add product"}
          </h2>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs uppercase tracking-[0.22em] text-slate hover:text-ruby"
            >
              Cancel edit
            </button>
          ) : null}
        </div>

        <div className="mt-6 rounded-2xl border border-ruby/15 bg-pearl/50 px-4 py-3 sm:px-5">
          <p className="caps-label caps-28 text-xs uppercase text-slate">
            Serial number
          </p>
          <p className="mt-1 font-display text-2xl tracking-wide text-charcoal">
            {editingId
              ? (editingProduct?.serial_number ?? "—")
              : serialPreviewLoading
                ? "Assigning…"
                : serialPrefix
                  ? (serialPreview ?? "—")
                  : form.category === "jewelry"
                    ? "Select a jewelry type"
                    : form.category === "gemstone"
                      ? "Select a gemstone colour"
                      : "—"}
          </p>
          <p className="mt-1 text-xs text-slate">
            {editingId
              ? "Serial stays with this product until it is permanently deleted."
              : serialPrefix
                ? `Prefix ${serialPrefix}${
                    serialPrefix === WATCH_SERIAL_PREFIX
                      ? " (watches)"
                      : serialPrefix === DIAMOND_SERIAL_PREFIX
                        ? " (diamonds)"
                        : selectedJewelryType
                          ? ` · ${selectedJewelryType.name}`
                          : selectedGemstoneColor
                            ? ` · ${selectedGemstoneColor.name}`
                            : ""
                  }. Deactivated items keep their number; deleted items free it for reuse.`
                : form.category === "jewelry"
                  ? "Choose jewelry type to preview the next serial."
                  : form.category === "gemstone"
                    ? "Choose gemstone colour to preview the next serial."
                    : "—"}
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="caps-label caps-28 text-xs uppercase text-slate">
              Category
            </span>
            <select
              value={form.category}
              onChange={(event) => {
                const category = event.target.value as ProductCategory;
                setAddingType(false);
                setNewTypeName("");
                setAddingColor(false);
                setNewColorName("");
                setForm((current) => ({
                  ...current,
                  category,
                  jewelry_type_id:
                    category === "jewelry" ? current.jewelry_type_id : "",
                  gemstone_color_id:
                    category === "gemstone" ? current.gemstone_color_id : "",
                  details:
                    category === "jewelry"
                      ? { stones: [emptyJewelryStone()] }
                      : {}
                }));
              }}
              className="form-field mt-2 rounded-2xl"
            >
              <option value="watch">Watch</option>
              <option value="jewelry">Jewelry</option>
              <option value="diamond">Diamonds</option>
              <option value="gemstone">Gemstones</option>
            </select>
          </label>

          <label className="block">
            <span className="caps-label caps-28 text-xs uppercase text-slate">
              Stock status
            </span>
            <select
              value={form.stock_status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  stock_status: event.target.value as StockStatus
                }))
              }
              className="form-field mt-2 rounded-2xl"
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
          </label>

          <label className="block">
            <span className="caps-label caps-28 text-xs uppercase text-slate">
              Brand
            </span>
            <input
              required
              value={form.brand}
              onChange={(event) =>
                setForm((current) => ({ ...current, brand: event.target.value }))
              }
              className="form-field mt-2 rounded-2xl"
            />
          </label>

          <label className="block">
            <span className="caps-label caps-28 text-xs uppercase text-slate">
              Name
            </span>
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="form-field mt-2 rounded-2xl"
            />
          </label>

          <label className="block">
            <span className="caps-label caps-28 text-xs uppercase text-slate">
              Price (HKD)
            </span>
            <input
              required
              inputMode="decimal"
              value={form.price}
              onChange={(event) =>
                setForm((current) => ({ ...current, price: event.target.value }))
              }
              className="form-field mt-2 rounded-2xl"
            />
          </label>

          <label className="block">
            <span className="caps-label caps-28 text-xs uppercase text-slate">
              Condition
            </span>
            <input
              value={form.condition}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  condition: event.target.value
                }))
              }
              placeholder="e.g. Excellent, Unworn"
              className="form-field mt-2 rounded-2xl"
            />
          </label>
        </div>

        <label className="mt-5 block">
          <span className="caps-label caps-28 text-xs uppercase text-slate">
            Description
          </span>
          <textarea
            rows={4}
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value
              }))
            }
            className="form-field mt-2 rounded-2xl"
          />
        </label>

        <div className="mt-8">
          <p className="caps-label caps-28 text-xs uppercase text-slate">
            {CATEGORY_LABELS[form.category]} details
          </p>

          {form.category === "jewelry" ? (
            <div className="mt-4 rounded-2xl border border-ruby/10 bg-pearl/40 p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.18em] text-slate">
                    Jewelry type
                  </span>
                  <select
                    required
                    value={form.jewelry_type_id}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value === "__add_new__") {
                        setAddingType(true);
                        setForm((current) => ({
                          ...current,
                          jewelry_type_id: ""
                        }));
                        return;
                      }
                      setAddingType(false);
                      setNewTypeName("");
                      setForm((current) => ({
                        ...current,
                        jewelry_type_id: value
                      }));
                    }}
                    className="form-field mt-2 rounded-2xl"
                  >
                    <option value="">Select type…</option>
                    {jewelryTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.serial_prefix})
                      </option>
                    ))}
                    <option value="__add_new__">+ Add new type…</option>
                  </select>
                </label>
                {!addingType && jewelryTypes.length > 0 ? (
                  <div className="flex items-center gap-4 sm:mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setAddingType(true);
                        setForm((current) => ({
                          ...current,
                          jewelry_type_id: ""
                        }));
                      }}
                      className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-ruby transition hover:text-charcoal"
                    >
                      Add type
                    </button>
                    {form.jewelry_type_id ? (
                      <button
                        type="button"
                        disabled={deletingType}
                        onClick={() => void deleteJewelryType()}
                        className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-ruby/70 transition hover:text-ruby disabled:opacity-60"
                      >
                        {deletingType ? "Deleting…" : "Delete type"}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {addingType ? (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <label className="block flex-1">
                    <span className="text-xs uppercase tracking-[0.18em] text-slate">
                      New type name
                    </span>
                    <input
                      value={newTypeName}
                      onChange={(event) => setNewTypeName(event.target.value)}
                      placeholder="e.g. Ring, Necklace, Bracelet"
                      className="form-field mt-2 rounded-2xl"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void addJewelryType();
                        }
                      }}
                    />
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={savingType}
                      onClick={() => void addJewelryType()}
                      className="rounded-full bg-ruby px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-pearl disabled:opacity-60"
                    >
                      {savingType ? "Saving…" : "Save type"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingType(false);
                        setNewTypeName("");
                      }}
                      className="rounded-full border border-ruby/20 px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {form.category === "gemstone" ? (
            <div className="mt-4 rounded-2xl border border-ruby/10 bg-pearl/40 p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.18em] text-slate">
                    Colour
                  </span>
                  <select
                    required
                    value={form.gemstone_color_id}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value === "__add_new__") {
                        setAddingColor(true);
                        setForm((current) => ({
                          ...current,
                          gemstone_color_id: ""
                        }));
                        return;
                      }
                      setAddingColor(false);
                      setNewColorName("");
                      setForm((current) => ({
                        ...current,
                        gemstone_color_id: value
                      }));
                    }}
                    className="form-field mt-2 rounded-2xl"
                  >
                    <option value="">Select colour…</option>
                    {gemstoneColors.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name} ({color.serial_prefix})
                      </option>
                    ))}
                    <option value="__add_new__">+ Add new colour…</option>
                  </select>
                </label>
                {!addingColor && gemstoneColors.length > 0 ? (
                  <div className="flex items-center gap-4 sm:mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setAddingColor(true);
                        setForm((current) => ({
                          ...current,
                          gemstone_color_id: ""
                        }));
                      }}
                      className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-ruby transition hover:text-charcoal"
                    >
                      Add colour
                    </button>
                    {form.gemstone_color_id ? (
                      <button
                        type="button"
                        disabled={deletingColor}
                        onClick={() => void deleteGemstoneColor()}
                        className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-ruby/70 transition hover:text-ruby disabled:opacity-60"
                      >
                        {deletingColor ? "Deleting…" : "Delete colour"}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {addingColor ? (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <label className="block flex-1">
                    <span className="text-xs uppercase tracking-[0.18em] text-slate">
                      New colour name
                    </span>
                    <input
                      value={newColorName}
                      onChange={(event) => setNewColorName(event.target.value)}
                      placeholder="e.g. Blue, Pink, Green"
                      className="form-field mt-2 rounded-2xl"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void addGemstoneColor();
                        }
                      }}
                    />
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={savingColor}
                      onClick={() => void addGemstoneColor()}
                      className="rounded-full bg-ruby px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-pearl disabled:opacity-60"
                    >
                      {savingColor ? "Saving…" : "Save colour"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingColor(false);
                        setNewColorName("");
                      }}
                      className="rounded-full border border-ruby/20 px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {detailFields.map((field) => (
              <label key={field.key} className="block">
                <span className="text-xs uppercase tracking-[0.18em] text-slate">
                  {field.label}
                </span>
                <input
                  value={
                    typeof form.details[field.key] === "string"
                      ? form.details[field.key]
                      : ""
                  }
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      details: {
                        ...current.details,
                        [field.key]: event.target.value
                      }
                    }))
                  }
                  className="form-field mt-2 rounded-2xl"
                />
              </label>
            ))}
          </div>

          {form.category === "jewelry" ? (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate">
                  Stones / diamonds
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      details: {
                        ...current.details,
                        stones: [
                          ...jewelryStonesFromForm(current.details),
                          emptyJewelryStone()
                        ]
                      }
                    }))
                  }
                  className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-ruby transition hover:text-charcoal"
                >
                  Add stone
                </button>
              </div>

              {jewelryStonesFromForm(form.details).map((stone, index) => (
                <div
                  key={`stone-${index}`}
                  className="rounded-2xl border border-ruby/10 bg-pearl/40 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate">
                      Stone {index + 1}
                    </p>
                    {jewelryStonesFromForm(form.details).length > 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((current) => {
                            const stones = jewelryStonesFromForm(
                              current.details
                            ).filter((_, i) => i !== index);
                            return {
                              ...current,
                              details: {
                                ...current.details,
                                stones:
                                  stones.length > 0
                                    ? stones
                                    : [emptyJewelryStone()]
                              }
                            };
                          })
                        }
                        className="text-[0.65rem] uppercase tracking-[0.18em] text-ruby"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-3 grid gap-4 sm:grid-cols-3">
                    <label className="block sm:col-span-1">
                      <span className="text-xs uppercase tracking-[0.18em] text-slate">
                        Name
                      </span>
                      <input
                        value={stone.name}
                        placeholder="e.g. Diamond, Sapphire"
                        onChange={(event) =>
                          setForm((current) => {
                            const stones = [
                              ...jewelryStonesFromForm(current.details)
                            ];
                            stones[index] = {
                              ...stones[index],
                              name: event.target.value
                            };
                            return {
                              ...current,
                              details: { ...current.details, stones }
                            };
                          })
                        }
                        className="form-field mt-2 rounded-2xl"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs uppercase tracking-[0.18em] text-slate">
                        Size
                      </span>
                      <input
                        value={stone.size ?? ""}
                        placeholder="e.g. 0.5 ct, 6mm"
                        onChange={(event) =>
                          setForm((current) => {
                            const stones = [
                              ...jewelryStonesFromForm(current.details)
                            ];
                            stones[index] = {
                              ...stones[index],
                              size: event.target.value
                            };
                            return {
                              ...current,
                              details: { ...current.details, stones }
                            };
                          })
                        }
                        className="form-field mt-2 rounded-2xl"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs uppercase tracking-[0.18em] text-slate">
                        No.{" "}
                        <span className="normal-case tracking-normal text-slate/70">
                          (optional)
                        </span>
                      </span>
                      <input
                        value={stone.quantity ?? ""}
                        placeholder="e.g. 2"
                        onChange={(event) =>
                          setForm((current) => {
                            const stones = [
                              ...jewelryStonesFromForm(current.details)
                            ];
                            stones[index] = {
                              ...stones[index],
                              quantity: event.target.value
                            };
                            return {
                              ...current,
                              details: { ...current.details, stones }
                            };
                          })
                        }
                        className="form-field mt-2 rounded-2xl"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-8">
          <p className="caps-label caps-28 text-xs uppercase text-slate">
            Images
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={(event) => uploadImages(event.target.files)}
            className="mt-3 block w-full text-sm text-slate file:mr-4 file:rounded-full file:border-0 file:bg-ruby file:px-5 file:py-2.5 file:text-xs file:font-semibold file:uppercase file:tracking-[0.18em] file:text-pearl"
          />
          {uploading ? (
            <p className="mt-2 text-sm text-slate">Uploading…</p>
          ) : null}
          {form.images.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {form.images.map((image) => (
                <div key={image} className="relative aspect-square overflow-hidden rounded-2xl bg-mist">
                  <Image src={image} alt="" fill className="object-cover" sizes="160px" />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        images: current.images.filter((item) => item !== image)
                      }))
                    }
                    className="absolute right-2 top-2 rounded-full bg-pearl/90 px-2 py-1 text-[0.65rem] uppercase tracking-wider text-ruby"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <label className="mt-6 flex items-center gap-3 text-sm text-charcoal">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                is_active: event.target.checked
              }))
            }
            className="h-4 w-4 accent-ruby"
          />
          Active on public collection pages
        </label>

        <div className="mt-8 rounded-2xl border border-dashed border-ruby/25 bg-charcoal/[0.03] p-4 sm:p-5">
          <p className="caps-label caps-28 text-xs uppercase text-ruby">
            Confidential · company use only
          </p>
          <p className="mt-2 text-xs leading-6 text-slate">
            These fields are never shown on the public website. They appear only
            in the company Excel export.
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.18em] text-slate">
                Cost
              </span>
              <input
                inputMode="decimal"
                value={form.cost}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    cost: event.target.value
                  }))
                }
                placeholder="Internal cost"
                className="form-field mt-2 rounded-2xl"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.18em] text-slate">
                Source name
              </span>
              <input
                value={form.source_name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    source_name: event.target.value
                  }))
                }
                placeholder="Supplier / source"
                className="form-field mt-2 rounded-2xl"
              />
            </label>
            <label className="block sm:col-span-1">
              <span className="text-xs uppercase tracking-[0.18em] text-slate">
                Source link
              </span>
              <input
                type="url"
                value={form.source_link}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    source_link: event.target.value
                  }))
                }
                placeholder="https://…"
                className="form-field mt-2 rounded-2xl"
              />
            </label>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-ruby">{error}</p> : null}
        {status ? <p className="mt-4 text-sm text-slate">{status}</p> : null}

        <button
          type="submit"
          disabled={saving || uploading}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-ruby px-8 py-4 text-xs font-semibold uppercase tracking-[0.28em] text-pearl transition hover:bg-charcoal disabled:opacity-60"
        >
          {saving ? "Saving…" : editingId ? "Update product" : "Add product"}
        </button>
      </form>

      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-3xl text-charcoal">
            Existing products
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => exportInventory("general")}
              disabled={products.length === 0}
              className="inline-flex items-center justify-center rounded-full border border-ruby/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-ruby transition hover:bg-ruby hover:text-pearl disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export inventory
            </button>
            <button
              type="button"
              onClick={() => exportInventory("company")}
              disabled={products.length === 0}
              className="inline-flex items-center justify-center rounded-full bg-ruby px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-pearl transition hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export company (con)
            </button>
          </div>
        </div>
        {products.length === 0 ? (
          <p className="mt-6 text-slate">No products yet.</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex flex-col gap-4 rounded-[1.5rem] border border-ruby/10 bg-white/55 p-4 sm:flex-row sm:items-center"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-mist">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.22em] text-ruby/70">
                    {product.serial_number} · {CATEGORY_LABELS[product.category]}
                    {product.category === "jewelry" && product.jewelry_type_name
                      ? ` · ${product.jewelry_type_name}`
                      : ""}
                    {product.category === "gemstone" &&
                    product.gemstone_color_name
                      ? ` · ${product.gemstone_color_name}`
                      : ""}{" "}
                    · {stockLabel(product.stock_status)}
                    {!product.is_active ? " · inactive" : ""}
                  </p>
                  <p className="mt-1 font-display text-xl text-charcoal">
                    {product.brand} {product.name}
                  </p>
                  <p className="text-sm text-slate">
                    {formatPrice(product.price, product.currency)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(product)}
                    className="cursor-pointer rounded-full border border-ruby/20 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ruby"
                  >
                    Edit
                  </button>
                  {product.is_active ? (
                    <button
                      type="button"
                      onClick={() => deactivateProduct(product.id)}
                      className="cursor-pointer rounded-full border border-ruby/20 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate"
                    >
                      Deactivate
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(product)}
                    className="cursor-pointer rounded-full border border-ruby/20 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ruby"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 px-5 backdrop-blur-[2px]"
          role="presentation"
          onClick={() => {
            if (!deletingProduct) setDeleteTarget(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
            className="w-full max-w-md rounded-[1.5rem] border border-ruby/15 bg-pearl p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <p
              id="delete-product-title"
              className="font-display text-2xl text-charcoal"
            >
              Delete this product?
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              Permanently delete{" "}
              <span className="font-medium text-charcoal">
                {deleteTarget.brand} {deleteTarget.name}
              </span>
              {deleteTarget.serial_number
                ? ` (${deleteTarget.serial_number})`
                : ""}
              . This cannot be undone.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={deletingProduct}
                onClick={() => setDeleteTarget(null)}
                className="cursor-pointer rounded-full border border-ruby/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate transition hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingProduct}
                onClick={() => void confirmDeleteProduct()}
                className="cursor-pointer rounded-full bg-ruby px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-pearl transition hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingProduct ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
