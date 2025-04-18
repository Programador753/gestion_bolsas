"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SlugPage() {
    const pathname = usePathname();
    const slug = pathname.split("/").pop(); // Obtiene el slug de la URL
    
    return (
        <div className="min-h-screen flex flex-col items-center">
        <main className="flex-grow px-4 py-8 w-full max-w-lg">
            <h1 className="text-center text-2xl font-bold text-red-600 mb-6">Bolsas para {slug}</h1>
    
            <div className="overflow-x-auto">
            <table className="w-full table-auto border border-collapse">
                <thead>
                <tr>
                    <th className="border px-4 py-2">Nombre de la bolsa</th>
                    <th className="border px-4 py-2">Acciones</th>
                </tr>
                </thead>
                <tbody>
                
                </tbody>
            </table>
            </div>
        </main>
        </div>
    );
    }
