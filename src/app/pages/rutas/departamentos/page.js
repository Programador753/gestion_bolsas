//Es una ruta dinamica
import React from "react";
import Link from "next/link";

export default function Bolsas() {

    return (
        <div>
          <h1>Bolsas</h1>
          <Link href="/bolsas/presupuesto">Bolsa Presupuesto</Link>
          <br />
          <Link href="/bolsas/inversion">Bolsa Inversion</Link>
        </div>
      );
}