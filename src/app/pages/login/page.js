// src/app/login/page.js o pages/login.js

"use client"; // Importante si usas Next.js 13+ con rutas en app

import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react"; // Importar el hook useSession
import React from "react";
import { useEffect } from "react";


const Login = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-semibold mb-4">Inicia sesión</h1>
        <button 
          className="px-6 py-2 bg-blue-500 text-white rounded-lg" 
          onClick={() => signIn("google")}>
          Iniciar sesión con Google
        </button>
      </div>
    </div>
  );
};

const Logout = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-semibold mb-4">Has iniciado sesión</h1>
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

  
  return session ? <Logout /> : <Login />;

}
