import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import {
  getAllProductsForAdmin,
  getGemstoneColors,
  getJewelryTypes
} from "@/lib/products";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    redirect("/admin/login");
  }

  const [products, jewelryTypes, gemstoneColors] = await Promise.all([
    getAllProductsForAdmin(),
    getJewelryTypes(),
    getGemstoneColors()
  ]);

  return (
    <main className="min-h-screen px-5 pt-28 pb-24">
      <AdminDashboard
        initialProducts={products}
        initialJewelryTypes={jewelryTypes}
        initialGemstoneColors={gemstoneColors}
        adminEmail={user.email ?? "admin"}
      />
    </main>
  );
}
