"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  JEWELRY_DETAIL_FIELDS,
  WATCH_DETAIL_FIELDS,
  emptyJewelryStone,
  formatJewelryWeight,
  formatPrice,
  getJewelryStones,
  stockLabel,
  type JewelryStone,
  type Product,
  type ProductCategory,
  type ProductDetails,
  type StockStatus
} from "@/lib/types/product";

type AdminDashboardProps = {
  initialProducts: Product[];
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
  details: ProductDetails;
  images: string[];
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
  details: {},
  images: []
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
    details,
    images: product.images ?? []
  };
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
  adminEmail
}: AdminDashboardProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const detailFields = useMemo(
    () =>
      form.category === "watch" ? WATCH_DETAIL_FIELDS : JEWELRY_DETAIL_FIELDS,
    [form.category]
  );

  function resetForm() {
    setForm(emptyForm());
    setEditingId(null);
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
      details: sanitizeDetails(form.details)
    };

    const supabase = createClient();

    try {
      if (editingId) {
        const { data, error: updateError } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingId)
          .select("*")
          .single();
        if (updateError) throw updateError;
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
            created_at: data.created_at,
            updated_at: data.updated_at
          },
          ...current
        ]);
        setStatus("Product added.");
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

  async function deleteProduct(id: string) {
    if (!window.confirm("Permanently delete this product?")) return;
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
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

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="caps-label caps-28 text-xs uppercase text-slate">
              Category
            </span>
            <select
              value={form.category}
              onChange={(event) => {
                const category = event.target.value as ProductCategory;
                setForm((current) => ({
                  ...current,
                  category,
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
            {form.category === "watch" ? "Watch details" : "Jewelry details"}
          </p>
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
        <h2 className="font-display text-3xl text-charcoal">Existing products</h2>
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
                    {product.category} · {stockLabel(product.stock_status)}
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
                    className="rounded-full border border-ruby/20 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ruby"
                  >
                    Edit
                  </button>
                  {product.is_active ? (
                    <button
                      type="button"
                      onClick={() => deactivateProduct(product.id)}
                      className="rounded-full border border-ruby/20 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate"
                    >
                      Deactivate
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => deleteProduct(product.id)}
                    className="rounded-full border border-ruby/20 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ruby"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
