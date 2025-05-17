"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function GestionPage() {
  const params = useParams();
  const nombre = decodeURIComponent(params?.gestion || "");
  const { data: session, status } = useSession();

  const [proveedor, setProveedor] = useState(null);
  const [departamentos, setDepartamentos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const rol = session?.user?.role;
  const departamentoUsuario = session?.user?.departamento;

  const idDepartamentoUsuario =
    session?.user?.id ||
    session?.user?.departamento ||
    session?.user?.Id_Departamento;

  // Cargar datos al montar
  useEffect(() => {
    if (!session) return;
    const fetchData = async () => {
      try {
        // 1. Obtener proveedores
        const proveedoresRes = await fetch("/api/proveedores");
        if (!proveedoresRes.ok) throw new Error("Error al obtener proveedores");
        const proveedoresData = await proveedoresRes.json();
        const proveedoresList = Array.isArray(proveedoresData)
          ? proveedoresData
          : Array.isArray(proveedoresData.proveedores)
            ? proveedoresData.proveedores
            : [];
        const proveedorSel = proveedoresList.find(
          (p) => p.nombre.toLowerCase() === nombre.toLowerCase()
        );
        setProveedor(proveedorSel);

        // 2. Obtener departamentos
        const departamentosRes = await fetch("/api/departamentos");
        if (!departamentosRes.ok)
          throw new Error("Error al obtener departamentos");
        const departamentosData = await departamentosRes.json();
        const departamentosList = Array.isArray(departamentosData)
          ? departamentosData
          : Array.isArray(departamentosData.departamentos)
            ? departamentosData.departamentos
            : [];

        // Filtrar departamentos según el rol
        let departamentosFiltrados = departamentosList;
        if (rol === "Jefe_Departamento") {
          departamentosFiltrados = departamentosList.filter(
            (dep) =>
              dep.Id_Departamento === idDepartamentoUsuario ||
              dep.nombre.trim().toLowerCase() ===
                String(departamentoUsuario).trim().toLowerCase()
          );
        }
        setDepartamentos(departamentosFiltrados);

        // 3. Obtener departamentos relacionados
        if (proveedorSel) {
          const relacionadosRes = await fetch(
            `/api/proveedores/${proveedorSel.Id_Proveedor}/departamentos`
          );
          if (!relacionadosRes.ok)
            throw new Error("Error al obtener departamentos relacionados");
          const relacionados = await relacionadosRes.json();
          setSeleccionados(relacionados); // Array de Id_Departamento
        }
      } catch (err) {
        setMensaje(err.message || "Error de red");
        console.error(err);
      }
    };
    fetchData();
  }, [nombre, session, rol, departamentoUsuario, idDepartamentoUsuario]);

  // Manejar cambios en los checkboxes
  const handleCheckboxChange = (id) => {
    // Solo permitir cambios si es admin o jefe sobre su propio departamento
    if (rol === "Contable") return;
    if (rol === "Jefe_Departamento") {
      // Solo puede marcar/desmarcar su propio departamento
      const dep = departamentos.find((d) => d.Id_Departamento === id);
      if (!dep || dep.nombre !== departamentoUsuario) return;
    }
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((depId) => depId !== id) : [...prev, id]
    );
  };

  // Guardar cambios en el backend
  const handleGuardar = async () => {
    if (!proveedor) return;
    let departamentosAGuardar = seleccionados;
    // Si es jefe, solo puede guardar su departamento
    if (rol === "Jefe_Departamento") {
      const dep = departamentos.find((d) => d.nombre === departamentoUsuario);
      if (dep) {
        departamentosAGuardar = seleccionados.filter(
          (id) => id === dep.Id_Departamento
        );
      }
    }
    const res = await fetch("/api/proveedores/relacionar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idProveedor: proveedor.Id_Proveedor,
        departamentos: departamentosAGuardar,
      }),
    });
    if (res.ok) {
      setMensaje("Cambios guardados con éxito");
      // Recarga los departamentos relacionados desde el backend
      const relacionadosRes = await fetch(
        `/api/proveedores/${proveedor.Id_Proveedor}/departamentos`
      );
      const relacionados = await relacionadosRes.json();
      setSeleccionados(relacionados);
      setTimeout(() => setMensaje(""), 3000);
    } else {
      setMensaje("Error al guardar los cambios");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  if (status === "loading" || !session) return <div>Cargando...</div>;
  if (!proveedor) return <div>Cargando...</div>;

  // Solo puede guardar si es admin o jefe
  const puedeGuardar = rol === "Administrador" || rol === "Jefe_Departamento";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-6 px-4 pb-4 relative">
      <h1 className="text-3xl font-extrabold mb-6 text-red-600">
        Gestión de Proveedor: {proveedor.nombre}
      </h1>
      {mensaje && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-md text-white shadow-lg 
        ${mensaje.includes("éxito") ? "bg-green-600" : "bg-red-600"}`}
        >
          {mensaje 
            .includes("éxito")
            ? "Cambios guardados con éxito"
            : "Error al guardar los cambios"}

        </div>
      )}
      {/* Botón Volver estático arriba a la izquierda */}
      <div className="w-full">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-red-700 hover:text-red-900 font-bold text-lg mb-6 mt-1 ml-4 bg-transparent"
          aria-label="Volver"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver
        </button>
      </div>
      <div className="w-full max-w-2xl bg-white text-black p-4 rounded-xl shadow-lg border border-black relative">
        <h1 className="text-3xl font-extrabold mb-6 text-red-600">
          {proveedor.nombre}
        </h1>
        <div>
          <h2 className="text-xl font-bold mb-4">Departamentos relacionados</h2>
          <p className="text-gray-600 mb-4">
            Selecciona los departamentos que deseas relacionar con el proveedor.
            {rol === "Contable" && " (No puedes modificar)"}
            {rol === "Jefe_Departamento" &&
              ` (Solo puedes modificar tu departamento: ${departamentoUsuario})`}
          </p>
          <div className="space-y-3">
            {departamentos.map((dep) => (
              <div
                key={dep.Id_Departamento}
                className="flex justify-between items-center bg-white border border-black px-4 py-3 rounded-lg hover:bg-gray-100 transition"
              >
                <span className="font-medium">{dep.nombre}</span>
                <input
                  type="checkbox"
                  className="h-5 w-5 text-red-600 accent-red-600 cursor-pointer"
                  checked={seleccionados.includes(dep.Id_Departamento)}
                  onChange={() => handleCheckboxChange(dep.Id_Departamento)}
                  disabled={
                    rol === "Contable" ||
                    (rol === "Jefe_Departamento" &&
                      dep.nombre !== departamentoUsuario)
                  }
                />
              </div>
            ))}
          </div>
        </div>
        {puedeGuardar && (
          <button
            onClick={handleGuardar}
            className="fixed bottom-10 right-10 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg z-50"
          >
            Guardar cambios
          </button>
        )}
      </div>
    </div>
  );
}
