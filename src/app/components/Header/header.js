import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header
      className="bg-gradient-to-r from-[#db001b] to-[#b30017] text-white shadow-lg"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: "80px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        backgroundColor: "rgba(219, 0, 27, 0.9)", // Color de fondo con opacidad
        backdropFilter: "blur(10px)", // Efecto de desenfoque
        WebkitBackdropFilter: "blur(10px)", // Efecto de desenfoque para Safari
        borderBottom: "1px solid rgba(255, 255, 255, 0.2)", // Borde inferior
        borderRadius: "0 0 10px 10px", // Bordes redondeados inferiores
        transition: "background-color 0.3s ease-in-out", // Transición suave para el color de fondo
      }}
    >
      {/* Logo y título */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <Image
          src="/logoSalesianosWeb.png"
          alt="Logo Salesianos"
          width={50}
          height={50}
          style={{ borderRadius: "50%" }}
        />
        <div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>Gestión</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>Salesianos</div>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "30px",
          fontSize: "18px",
          fontWeight: "bold",
          color: "white",
        }}
      >
        <Link href="/" style={{ color: "white", textDecoration: "none" }}>
          Inicio
        </Link>
        <Link href="#" style={{ color: "white", textDecoration: "none" }}>
          Órdenes de Compra
        </Link>
        <Link href="/pages/rutas/bolsas" style={{ color: "white", textDecoration: "none" }}>
          Bolsas
        </Link>
        {/* Tooltip personalizado para Departamentos */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <Link href="/pages/rutas/departamentos" style={{ color: "white", textDecoration: "none" }}>
            Departamentos
          </Link>
        </div>
        <Link href="#" style={{ color: "white", textDecoration: "none" }}>
          Proveedores
        </Link>
      </nav>

      {/* Imagen de perfil */}
      <div>
        <Image
          src="/sdb-logo-big.png"
          alt="Usuario"
          width={60}
          height={60}
          style={{ borderRadius: "50%" }}
          className="cursor-pointer"
        />
      </div>
    </header>
  );
}
