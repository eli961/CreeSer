import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";

const NAV = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/alumnas", label: "Alumnas" },
  { href: "/admin/pagos", label: "Pagos y comprobantes" },
  { href: "/admin/cobranza", label: "Cobranza · quién debe" },
  { href: "/admin/contenido/clases", label: "Clases" },
  { href: "/admin/contenido/avisos", label: "Avisos" },
  { href: "/admin/contenido/grabaciones", label: "Grabaciones" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();

  return (
    <div className="admin">
      <div className="admin__shell">
        <aside className="admin__side">
          <Image src="/assets/creeser-logo.png" alt="Cree Ser" width={100} height={32} />
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <div style={{ marginTop: "auto", padding: "12px", fontSize: 13, color: "rgba(234,246,247,.6)" }}>
            {profile.email}
          </div>
        </aside>
        <main className="admin__main">{children}</main>
      </div>
    </div>
  );
}
