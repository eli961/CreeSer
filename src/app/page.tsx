import { createClient } from "@/lib/supabase/server";
import type { Aviso, Clase, FechaImportante } from "@/lib/types";
import Topbar from "@/components/site/Topbar";
import Nav from "@/components/site/Nav";
import Hero from "@/components/site/Hero";
import Programas from "@/components/site/Programas";
import Temario from "@/components/site/Temario";
import Calendario from "@/components/site/Calendario";
import Avisos from "@/components/site/Avisos";
import Inscripciones from "@/components/site/Inscripciones";
import Pagos from "@/components/site/Pagos";
import Acerca from "@/components/site/Acerca";
import Grabaciones from "@/components/site/Grabaciones";
import Footer from "@/components/site/Footer";
import AuthModal from "@/components/site/AuthModal";

export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient();

  const [{ data: clases }, { data: fechas }, { data: avisos }] = await Promise.all([
    supabase.from("clases").select("*").returns<Clase[]>(),
    supabase.from("fechas_importantes").select("*").returns<FechaImportante[]>(),
    supabase.from("avisos").select("*").eq("activo", true).order("orden").returns<Aviso[]>(),
  ]);

  return (
    <>
      <Topbar />
      <Nav />
      <Hero />
      <Programas />
      <Temario />
      <Calendario clases={clases ?? []} fechas={fechas ?? []} />
      <Avisos avisos={avisos ?? []} />
      <Inscripciones />
      <Pagos />
      <Acerca />
      <Grabaciones />
      <Footer />
      <AuthModal />
    </>
  );
}
