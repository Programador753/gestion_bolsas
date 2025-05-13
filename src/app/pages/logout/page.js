"use client"; // Importante si usas Next.js 13+ con rutas en app

import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react"; // Importar el hook useSession
import React from "react";
import { useEffect } from "react";

const Logout = () => {
  const { data: session } = useSession(); // Usar el hook useSession
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-semibold mb-4">Has iniciado sesión</h1>
        <p className="mb-4">Bienvenido a la aplicación</p>
        <p className="mb-4">{`Usuario: ${session.user.name}`}</p>
        <p className="mb-4">{`Email: ${session.user.email}`}</p>
        <p className="mb-4">{`Rol: ${session.user.role}`}</p>
        <button 
          className="px-6 py-2 bg-red-500 text-white rounded-lg" 
          onClick={() => signOut()}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { data: session, status } = useSession(); // Usar el hook useSession

  useEffect(() => {
    if (status === "authenticated") {
      console.log("Usuario autenticado:", session.user);
    } else if (status === "unauthenticated") {
      console.log("Usuario no autenticado");
    }
  }, [status, session]);

  if (status === "loading") {
    return <div>Cargando...</div>; // Puedes mostrar un spinner o algo mientras carga
  }

  
  return <Logout />;

}
