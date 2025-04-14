//Es una ruta dinamica
import React from "react";
import Link from "next/link";

export default function Bolsas() {

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bolsas</h1>
      <p className="mb-4">Aquí puedes gestionar las bolsas.</p>
      <Link href="/rutas/bolsas/crear" className="text-blue-500 underline">
        Crear nueva bolsa
      </Link>
    </div>
  );
}