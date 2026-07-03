import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        textAlign: "center",
        padding: "48px 24px",
        background: "var(--cream)",
        color: "var(--ink)",
      }}
    >
      <Image
        src="/assets/creeser-logo.png"
        alt="Cree Ser"
        width={72}
        height={72}
        style={{ borderRadius: 16, margin: "0 auto 8px" }}
      />
      <p style={{ fontFamily: "var(--sans)", letterSpacing: ".08em", textTransform: "uppercase", fontSize: 13, color: "var(--ink-soft)" }}>
        Error 404
      </p>
      <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px, 5vw, 40px)", margin: 0 }}>
        No encontramos esta página
      </h1>
      <p style={{ fontFamily: "var(--sans)", color: "var(--ink-soft)", maxWidth: 440, margin: 0 }}>
        Puede que el enlace esté roto o la página se haya movido. Volvamos al inicio.
      </p>
      <Link
        href="/"
        style={{
          marginTop: 8,
          display: "inline-block",
          padding: "12px 28px",
          borderRadius: 999,
          background: "var(--teal)",
          color: "#fff",
          fontFamily: "var(--sans)",
          fontWeight: 600,
        }}
      >
        Volver al inicio
      </Link>
    </main>
  );
}
