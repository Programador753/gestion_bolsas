"use client"; // Indica que este componente se ejecuta en el cliente

import { signIn, signOut } from "next-auth/react";// Importa funciones para iniciar/cerrar sesión
import { useSession } from "next-auth/react";// Hook para obtener la sesión del usuario
import React, { useEffect } from "react"; // Importa React y el hook useEffect
import Image from "next/image"; // Componente de Next.js para imágenes optimizadas

const UserCard = () => { // Componente que muestra la información del usuario
  const { data: session } = useSession(); // Obtiene la sesión actual

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-white to-gray-100">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full border-t-8 border-[#E30613] animate-fade-in">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <Image
              src={session.user.image}
              alt={`Foto de perfil de ${session.user.name}`} // Texto alternativo
              width={100}
              height={100}
              className="rounded-full"
              priority // Prioridad de carga de ka imagen
            />
          <h1 className="text-2xl font-bold text-[#E30613] mt-4">
            {session.user.name}
          </h1>
          <p className="text-sm text-gray-600">
            Has iniciado sesión correctamente
          </p>
        </div>

        {/* Info */}
        <div className="space-y-3 text-gray-800 text-sm">
          <p>
            <span className="font-semibold">📧 Email:</span>{" "}
            {session.user.email}
          </p>
          <p>
            <span className="font-semibold">🛡️ Rol:</span> {session.user.role}
          </p>
          <p>
            <span className="font-semibold">🏢 Departamento:</span>{" "}
            {session.user.departamento}
          </p>
        </div>

        {/* Botón */}
        <button
          className="mt-8 w-full py-2 bg-[#E30613] hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200"
          onClick={() => signOut()} // Cierra la sesión al hacer clic
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default function LoginPage() {  // Componente principal de la página de logout
  const { data: session, status } = useSession(); // Obtiene la sesión y el estado de autenticación

  useEffect(() => { // Efecto que se ejecuta cuando cambia el estado de autenticación
    if (status === "authenticated") {
      console.log("Usuario autenticado:", session.user); // Log si autenticado
    } else if (status === "unauthenticated") {
      console.log("Usuario no autenticado"); // Log si no autenticado en la consola del navegador
    }
  }, [status, session]);

  if (status === "loading") { // Si la sesión está cargando, muestra mensaje de carga
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-lg font-medium text-gray-600">Cargando...</div>
      </div>
    );
  }

  return <UserCard />; // Si la sesión está lista, muestra la tarjeta de usuario
}
