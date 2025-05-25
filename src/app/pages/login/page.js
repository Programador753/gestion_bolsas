"use client";

import { signIn, signOut } from "next-auth/react"; // Importa funciones para iniciar/cerrar sesión con NextAuth
import { useSession } from "next-auth/react";// Importa funciones para iniciar/cerrar sesión con NextAuth
import { useEffect } from "react"; // Hook de React para efectos secundarios
import Image from "next/image";// Componente de Next.js para imágenes optimizadas

const Login = () => {// Componente de formulario de login
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f5f7fb] px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center border border-gray-200">
        {/* Logo institucional (puedes reemplazarlo por una imagen real) */}
        <div className="mb-6">
          <Image
          src="/logoSalesianosWeb.png" // Ruta de la imagen
          alt="Logo Salesianos" //Texto alternativo
          width={100}
          height={100}
          className="mx-auto mb-4"
        />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Plataforma de Gestión
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Accede con tu cuenta de Salesianos Zaragoza
        </p>

        <button
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition duration-200"
          onClick={() => signIn("google")} // Inicia sesión con Google usando NextAuth
        >
          Iniciar sesión con Google
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Solo cuentas autorizadas pueden acceder.
        </p>
      </div>
    </div>
  );
};

const Logout = () => { // Componente para mostrar cuando el usuario ya está autenticado
  const { data: session } = useSession(); // Obtiene la sesión actual
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h2 className="text-xl mb-2">Hola, {session.user.name}</h2> 
      <p className="text-sm text-gray-500 mb-4">Ya has iniciado sesión</p>
      <button
        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
        onClick={() => signOut()} // Cierra la sesión con NextAuth
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default function LoginPage() { // Componente principal de la página de login
  const { data: session, status } = useSession();// Obtiene la sesión y el estado de autenticación

  useEffect(() => { // Efecto que se ejecuta cuando cambia el estado de autenticación
    if (status === "authenticated") {
      console.log("✅ Usuario autenticado:", session.user); // Log si autenticado
    } else if (status === "unauthenticated") {
      console.log("🔐 Usuario no autenticado"); // Log si no autenticado
    }
  }, [status, session]);

  if (status === "loading") { // Si la sesión está cargando, muestra mensaje de carga
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600 text-lg animate-pulse">Cargando...</div>
      </div>
    );
  }

  return session ? <Logout /> : <Login />; // Si hay sesión, muestra Logout; si no, muestra Login
}
