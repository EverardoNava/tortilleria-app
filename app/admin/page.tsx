import { Suspense } from "react";
import { redirect } from "next/navigation";
import AdminDashboard from "@/app/admin/admin-dashboard";
import { getAdminSession } from "@/lib/auth";
import { getAdminOrders, getAdminProducts, getDailySalesReport } from "@/lib/data";

export default function AdminPage() {
  return (
    <Suspense fallback={<main className="admin-loading" aria-busy="true">Abriendo el mostrador…</main>}>
      <AdminContent />
    </Suspense>
  );
}

async function AdminContent() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [products, orders, salesReport] = await Promise.all([
    getAdminProducts(),
    getAdminOrders(),
    getDailySalesReport(),
  ]);
  return <AdminDashboard products={products} orders={orders} salesReport={salesReport} />;
}