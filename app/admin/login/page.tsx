import Link from "next/link";
import LoginForm from "@/app/admin/login/login-form";

export default function AdminLoginPage() {
  return (
    <main className="login-page">
      <Link href="/" className="back-home">← Volver al sitio</Link>
      <section className="login-panel">
        <div className="login-brand">
          <span className="brand-mark">CA</span>
          <span>CABRERA<small>ADMINISTRACIÓN</small></span>
        </div>
        <p className="eyebrow"><span /> ACCESO DEL EQUIPO</p>
        <h1>Qué bueno<br />verte <em>por aquí.</em></h1>
        <p className="login-intro">Entra para mantener al día el mostrador digital.</p>
        <LoginForm />
        <p className="login-footnote">Solo personal autorizado · Cabrera</p>
      </section>
      <div className="login-photo" role="img" aria-label="Tortillas recién hechas" />
    </main>
  );
}