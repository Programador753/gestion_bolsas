import React from "react";
import Link from "next/link";

export default function BolsaDetails({ params }){
    const { slug } = params; // Obtiene el slug de los parámetros de la ruta
    return (
        <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Detalles de la Bolsa</h1>
        <p className="mb-4">Detalles de la bolsa con slug: {slug}</p>
        <Link href="#" className="text-blue-500 underline">
            Crear nueva bolsa
        </Link>
        </div>
    );

}