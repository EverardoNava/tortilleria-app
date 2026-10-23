import { Suspense } from "react";
import Link from "next/link";
import { getPublicProducts } from "@/lib/data";

export default function Home() {
    return (
        <main>
            <section className="hero" id="inicio">
                <div className="hero-shade" />
                <header className="site-header">
                    <a className="brand" href="#inicio" aria-label="Cabrera, inicio">
                        <span className="brand-mark">CA</span>
                        <span>CABRERA<small>TORTILLERÍA DE BARRIO</small></span>
                    </a>
                    <nav className="main-nav" aria-label="Navegación principal">
                        <a href="#productos">Nuestros productos</a>
                        <a href="#visitanos">Visítanos</a>
                    </nav>
                    <Link className="header-order" href="/pedido">Pedir a domicilio <span>↗</span></Link>
                </header>

                <div className="hero-content">
                    <p className="eyebrow light-eyebrow"><span /> HECHO CON MAÍZ DE VERDAD</p>
                    <h1>El sabor de<br />volver a casa.</h1>
                    <p className="hero-copy">Tortillas calientitas, masa recién molida y ese olor que reúne a todos alrededor de la mesa.</p>
                    <a className="button button-light" href="#productos">Conoce lo nuestro <span>↓</span></a>
                </div>
                <div className="hero-note"><span>DESDE 1987</span><span>HECHO A MANO, TODOS LOS DÍAS</span></div>
            </section>

            <section className="welcome section-wrap">
                <div className="welcome-copy">
                    <p className="eyebrow"><span /> DE NUESTRA FAMILIA A LA TUYA</p>
                    <h2>El maíz sabe<br />mejor <em>cerca de casa.</em></h2>
                </div>
                <p className="welcome-text">Desde temprano prendemos el comal para llevar a tu mesa el sabor sencillo de las cosas bien hechas. Maíz, agua, cal y mucho cariño; así empieza cada día en Cabrera.</p>
            </section>

            <section className="offer-band" aria-label="Oferta de la semana">
                <div className="offer-stamp">BUENO<br />Y FRESCO</div>
                <div>
                    <p className="eyebrow light-eyebrow">PARA EMPEZAR BIEN LA SEMANA</p>
                    <h2>3 kilos de tortillas <em>por $65</em></h2>
                    <p>De lunes a miércoles, hasta agotar existencias.</p>
                </div>
                <a className="offer-link" href="tel:+525555123456">Aparta las tuyas <span>↗</span></a>
            </section>

            <section className="products-section section-wrap" id="productos">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow"><span /> RECIÉN HECHO PARA TI</p>
                        <h2>Del comal <em>a tu mesa.</em></h2>
                    </div>
                    <p>Ingredientes de siempre.<br />El cuidado de todos los días.</p>
                </div>
                <Suspense fallback={<div className="product-grid" aria-busy="true"><div className="product-skeleton" /><div className="product-skeleton" /><div className="product-skeleton" /></div>}>
                    <ProductGrid />
                </Suspense>
            </section>

            <section className="visit-section" id="visitanos">
                <div className="visit-image" role="img" aria-label="Tortillas recién hechas sobre un comal" />
                <div className="visit-copy">
                    <p className="eyebrow light-eyebrow"><span /> AQUÍ TE ESPERAMOS</p>
                    <h2>El comal<br />está <em>encendido.</em></h2>
                    <p>Ven por tus tortillas todavía calientitas. Estamos a la vuelta, como siempre.</p>
                    <a className="button button-outline" href="https://maps.google.com/?q=Av.+Hidalgo+124,+Ciudad+de+Mexico" target="_blank" rel="noreferrer">Cómo llegar <span>↗</span></a>
                </div>
            </section>

            <footer className="site-footer">
                <a className="brand footer-brand" href="#inicio">
                    <span className="brand-mark">CA</span>
                    <span>CABRERA<small>TORTILLERÍA DE BARRIO</small></span>
                </a>
                <div className="footer-detail"><span>ENCUÉNTRANOS</span><p>Av. Hidalgo 124, Centro<br />Ciudad de México</p></div>
                <div className="footer-detail"><span>HORARIO</span><p>Lun–Sáb · 7:00 a 19:00<br />Dom · 8:00 a 14:00</p></div>
                <div className="footer-detail"><span>HABLEMOS</span><p><a href="tel:+525555123456">55 5512 3456</a><br /><a href="mailto:hola@tortillerialamilpa.mx">hola@tortillerialamilpa.mx</a></p></div>
                <div className="footer-bottom"><span>© 2026 Cabrera · Hecho con maíz y cariño.</span><a href="/admin/login">Acceso administración <span>↗</span></a></div>
            </footer>
        </main>
    );
}

async function ProductGrid() {
    const products = await getPublicProducts();

    return (
        <div className="product-grid">
            {products.map((product, index) => (
                <article className="product-card" key={product.id}>
                    <div
                        className={`product-photo product-photo-${index + 1}`}
                        role="img"
                        aria-label={product.name}
                        style={{ backgroundImage: `url("${product.image}")` }}
                    >
                        {product.tag && <span className="product-tag">{product.tag}</span>}
                    </div>
                    <div className="product-info">
                        <div><h3>{product.name}</h3><p>{product.description}</p></div>
                        <div className="product-price"><strong>{new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(product.price)}</strong><span>{product.unit}</span></div>
                    </div>
                </article>
            ))}
        </div>
    );
}