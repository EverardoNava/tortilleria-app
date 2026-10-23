"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowUpRight, BarChart3, Box, Check, CirclePlus, ClipboardList, ImagePlus, LogOut, Pencil, Search, Trash2, X } from "lucide-react";
import type { ProductInput } from "@/lib/product-validation";
import type { PublicProduct } from "@/lib/sample-products";
import type { AdminOrder, DailySalesReport } from "@/lib/order-types";
import OrderManagement from "@/app/admin/order-management";
import SalesReport from "@/app/admin/sales-report";

type ProductDraft = Omit<ProductInput, "price"> & { price: string };

const emptyDraft: ProductDraft = {
  name: "",
  description: "",
  price: "",
  unit: "el kilo",
  image: "",
  tag: "",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(price);
}

export default function AdminDashboard({
  products: initialProducts,
  orders,
  salesReport,
}: {
  products: PublicProduct[];
  orders: AdminOrder[];
  salesReport: DailySalesReport;
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [activeSection, setActiveSection] = useState<"products" | "orders" | "sales">("products");
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.description}`.toLocaleLowerCase("es-MX").includes(search.toLocaleLowerCase("es-MX")),
  );

  function openNewProduct() {
    setDraft(emptyDraft);
    setEditingId(null);
    setIsFormOpen(true);
  }

  function openEditProduct(product: PublicProduct) {
    setDraft({
      name: product.name,
      description: product.description,
      price: String(product.price),
      unit: product.unit,
      image: product.image,
      tag: product.tag,
    });
    setEditingId(product.id);
    setIsFormOpen(true);
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const isEditing = Boolean(editingId);

    try {
      const response = await fetch(isEditing ? `/api/products/${editingId}` : "/api/products", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, price: Number(draft.price) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "No pudimos guardar el producto.");

      const product = result.product as PublicProduct;
      setProducts((current) => isEditing
        ? current.map((item) => item.id === product.id ? product : item)
        : [...current, product]);
      setIsFormOpen(false);
      toast.success(isEditing ? "Producto actualizado" : "Producto agregado");
      router.refresh();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "No pudimos guardar el producto.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProduct(product: PublicProduct) {
    if (!window.confirm(`¿Eliminar “${product.name}” del catálogo?`)) return;

    try {
      const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "No pudimos eliminar el producto.");
      setProducts((current) => current.filter((item) => item.id !== product.id));
      toast.success("Producto eliminado");
      router.refresh();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "No pudimos eliminar el producto.");
    }
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.replace("/admin/login");
    }
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="brand admin-brand" href="/">
          <span className="brand-mark">CA</span>
          <span>CABERERA<small>ADMINISTRACIÓN</small></span>
        </Link>
        <div className="sidebar-label">MENÚ</div>
        <button className={`sidebar-link ${activeSection === "products" ? "active" : ""}`} onClick={() => setActiveSection("products")}><Box size={18} /> Productos <span className="nav-count">{products.length}</span></button>
        <button className={`sidebar-link ${activeSection === "orders" ? "active" : ""}`} onClick={() => setActiveSection("orders")}><ClipboardList size={18} /> Pedidos <span className="nav-count">{orders.filter((order) => order.status === "PENDING").length || ""}</span></button>
        <button className={`sidebar-link ${activeSection === "sales" ? "active" : ""}`} onClick={() => setActiveSection("sales")}><BarChart3 size={18} /> Ventas</button>
        <div className="sidebar-bottom">
          <button className="sidebar-link logout-link" onClick={logout}><LogOut size={17} /> Cerrar sesión</button>
        </div>
      </aside>

      <section className="admin-main">
        <nav className="admin-mobile-nav" aria-label="Secciones de administración">
          <button className={activeSection === "products" ? "active" : ""} onClick={() => setActiveSection("products")}><Box size={15} />Productos</button>
          <button className={activeSection === "orders" ? "active" : ""} onClick={() => setActiveSection("orders")}><ClipboardList size={15} />Pedidos</button>
          <button className={activeSection === "sales" ? "active" : ""} onClick={() => setActiveSection("sales")}><BarChart3 size={15} />Ventas</button>
        </nav>
        <div className="admin-content">
          {activeSection === "products" ? <>
            <div className="admin-welcome">
              <div>
                <p className="eyebrow"><span /> MOSTRADOR DIGITAL</p>
                <h1>Productos <em>del día.</em></h1>
                <p>Administra lo que tus clientes encuentran en el mostrador.</p>
              </div>
              <button className="button add-product-button" onClick={openNewProduct}><CirclePlus size={18} /> Agregar producto</button>
            </div>

            <div className="admin-stats">
              <div className="stat-block"><span>PRODUCTOS EN CATÁLOGO</span><strong>{products.length.toString().padStart(2, "0")}</strong><small><ArrowUpRight size={14} /> Actualizado ahora</small></div>
              <div className="stat-note"><span className="stat-note-mark">✳</span><p>Lo hecho hoy<br /><em>se disfruta hoy.</em></p><span>CABRERA · DESDE 1987</span></div>
            </div>

            <div className="products-toolbar">
              <div><h2>Tu catálogo</h2><span>{filteredProducts.length} productos</span></div>
              <label className="admin-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar producto" /></label>
            </div>

            <div className="admin-product-list">
              <div className="product-list-heading"><span>PRODUCTO</span><span>PRECIO</span><span>ETIQUETA</span><span>ACCIONES</span></div>
              {filteredProducts.map((product) => (
                <article className="admin-product-row" key={product.id}>
                  <div className="admin-product-name">
                    <div className="admin-product-thumb" role="img" aria-label={product.name} style={{ backgroundImage: `url("${product.image}")` }} />
                    <div><strong>{product.name}</strong><span>{product.description}</span></div>
                  </div>
                  <div className="admin-price"><strong>{formatPrice(product.price)}</strong><span>{product.unit}</span></div>
                  <div><span className="product-category">{product.tag || "Sin etiqueta"}</span></div>
                  <div className="row-actions">
                    <button className="icon-action" onClick={() => openEditProduct(product)} aria-label={`Editar ${product.name}`} title="Editar"><Pencil size={16} /></button>
                    <button className="icon-action danger-action" onClick={() => deleteProduct(product)} aria-label={`Eliminar ${product.name}`} title="Eliminar"><Trash2 size={16} /></button>
                  </div>
                </article>
              ))}
              {!filteredProducts.length && <div className="empty-products"><Box size={25} /><p>{search ? "No hay productos que coincidan con la búsqueda." : "Todavía no hay productos en el catálogo."}</p></div>}
            </div>
          </> : activeSection === "orders" ? <OrderManagement initialOrders={orders} /> : <SalesReport initialReport={salesReport} />}
          <div className="admin-footer"><span>© 2026 Cabrera · Panel de administración</span><span>Hecho con maíz y cariño</span></div>
        </div>
      </section>

      {isFormOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsFormOpen(false); }}>
          <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
            <header className="modal-header">
              <div><p className="eyebrow"><span /> CATÁLOGO</p><h2 id="product-modal-title">{editingId ? "Editar producto" : "Nuevo producto"}</h2></div>
              <button className="icon-action" onClick={() => setIsFormOpen(false)} aria-label="Cerrar"><X size={19} /></button>
            </header>
            <form className="product-form" onSubmit={saveProduct}>
              <div className="form-grid">
                <label className="form-span-two">Nombre del producto<input required minLength={2} maxLength={80} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Ej. Tortillas de maíz" /></label>
                <label className="form-span-two">Descripción<textarea required minLength={5} maxLength={240} rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Cuéntale a tus clientes qué lo hace especial" /></label>
                <label>Precio<input required type="number" min="0.01" max="100000" step="0.01" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} placeholder="24.00" /></label>
                <label>Unidad de venta<input required maxLength={30} value={draft.unit} onChange={(event) => setDraft({ ...draft, unit: event.target.value })} placeholder="el kilo" /></label>
                <label className="form-span-two">Imagen (URL)<input required maxLength={500} value={draft.image} onChange={(event) => setDraft({ ...draft, image: event.target.value })} placeholder="https://… o /producto.jpg" /></label>
                <label className="form-span-two">Etiqueta <span className="optional-label">OPCIONAL</span><input maxLength={40} value={draft.tag} onChange={(event) => setDraft({ ...draft, tag: event.target.value })} placeholder="Favorito, Del día…" /></label>
              </div>
              {draft.image && <div className="image-preview" style={{ backgroundImage: `url("${draft.image}")` }}><ImagePlus size={17} /><span>Vista previa</span></div>}
              <div className="modal-actions">
                <button className="button button-muted" type="button" onClick={() => setIsFormOpen(false)}>Cancelar</button>
                <button className="button add-product-button" type="submit" disabled={isSaving}>{isSaving ? "Guardando…" : <><Check size={17} /> {editingId ? "Guardar cambios" : "Agregar producto"}</>}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}