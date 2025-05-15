"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function OrdenCompraPage() {
  const { data: session, status } = useSession();
  const [ordenesCompra, setOrdenesCompra] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [codigo, setCodigo] = useState("");
  const [numeroInversion, setNumeroInversion] = useState("");
  const [tipo, setTipo] = useState("");
  const [fecha, setFecha] = useState("");
  const [gasto, setGasto] = useState("");
  const [comentario, setComentario] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [tipoProducto, setTipoProducto] = useState("fungible");
  const [loading, setLoading] = useState(false);
  const [loadingProveedores, setLoadingProveedores] = useState(false);

  // Función para verificar si el usuario tiene permiso para eliminar
  const canDelete = () => {
    return session?.user?.role === "Administrador" || session?.user?.role === "Jefe_Departamento";
  };

  useEffect(() => {
    fetchOrdenes();
    fetchProveedores();
  }, []);

  const fetchOrdenes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ordenes");
      const data = await res.json();
      if (res.ok) {
        setOrdenesCompra(data.ordenes || []);
      } else {
        console.error("Error:", data.error);
      }
    } catch (err) {
      console.error("Error al cargar órdenes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProveedores = async () => {
    try {
      setLoadingProveedores(true);
      console.log("Intentando cargar proveedores...");
      
      const res = await fetch("/api/proveedores");
      console.log("Respuesta de API proveedores:", res.status);
      
      if (!res.ok) {
        throw new Error(`Error en la respuesta: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Datos de proveedores recibidos:", data);
      
      if (data.proveedores) {
        setProveedores(data.proveedores);
      } else if (Array.isArray(data)) {
        setProveedores(data);
      } else {
        console.error("Formato de datos inesperado:", data);
        setProveedores([]);
      }
    } catch (err) {
      console.error("Error al cargar proveedores:", err);
      alert("Error al cargar los proveedores. Consulta la consola para más detalles.");
    } finally {
      setLoadingProveedores(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codigo || !numeroInversion || !fecha || !gasto || !proveedor) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }
    
    const esFungible = tipoProducto === "fungible" ? "S" : "N";
    const esInventariable = tipoProducto === "inventariable" ? "S" : "N";

    const newOrden = {
      Codigo: codigo,
      NumeroInversion: numeroInversion,
      Tipo: tipo, // Este campo puede estar vacío
      Fecha: fecha,
      Gasto: gasto,
      Comentario: comentario,
      Id_Proveedor: proveedor,
      es_fungible: esFungible,
      es_inventariable: esInventariable,
    };

    try {
      setLoading(true);
      const res = await fetch("/api/ordenes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOrden),
      });

      const data = await res.json();

      if (res.ok) {
        setOrdenesCompra((prev) => [...prev, data.orden]);
        resetForm();
        alert("Orden de compra agregada con éxito");
      } else {
        console.error("Error:", data.error);
        alert(`Error: ${data.error || "Error al agregar la orden"}`);
      }
    } catch (err) {
      console.error("Error al agregar orden:", err);
      alert("Error al agregar la orden de compra");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
  if (!confirm("¿Estás seguro de que deseas eliminar esta orden de compra?")) {
    return;
  }

  try {
    setLoading(true);
    
    const res = await fetch(`/api/ordenes/${id}`, {
      method: "DELETE"
    });
    
    const textResponse = await res.text();
    console.log("Respuesta texto:", textResponse);
    
    let data;
    try {
      data = textResponse ? JSON.parse(textResponse) : {};
    } catch (parseError) {
      console.error("Error al parsear JSON:", parseError, "Texto recibido:", textResponse);
      alert("Error: La respuesta del servidor no es un JSON válido");
      setLoading(false);
      return;
    }
    
    if (res.ok) {

      setOrdenesCompra(ordenesCompra.filter(orden => orden.Id !== id));
      alert("Orden de compra eliminada con éxito");
    } else {
      console.error("Error al eliminar:", data.error || "Error desconocido");
      alert(`Error: ${data.error || "Error al eliminar la orden"}`);
    }
  } catch (err) {
    console.error("Error completo:", err);
    alert(`Error: ${err.message}`);
  } finally {
    setLoading(false);
  }
};
  const resetForm = () => {
    setCodigo("");
    setNumeroInversion("");
    setTipo("");
    setFecha("");
    setGasto("");
    setComentario("");
    setProveedor("");
    setTipoProducto("fungible");
  };

  return (
    <div className="p-8 bg-white text-black rounded shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-red-600 text-center">Órdenes de Compra</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Agregar Orden de Compra</h2>
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="Código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="number"
            placeholder="Número de Inversión"
            value={numeroInversion}
            onChange={(e) => setNumeroInversion(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            // No tiene required para que sea opcional
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="date"
            placeholder="Fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="number"
            placeholder="Gasto"
            value={gasto}
            onChange={(e) => setGasto(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded"
          />
          <select
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
            className="p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Selecciona Proveedor</option>
            {loadingProveedores ? (
              <option value="" disabled>Cargando proveedores...</option>
            ) : proveedores && proveedores.length > 0 ? (
              proveedores.map((prov) => {
                const id = prov.Id_Proveedor || prov.id || prov.ID;
                const nombre = prov.nombre || prov.name || prov.Nombre;
                
                return (
                  <option key={id} value={id}>
                    {nombre}
                  </option>
                );
              })
            ) : (
              <option value="" disabled>No hay proveedores disponibles</option>
            )}
          </select>
          <select
            value={tipoProducto}
            onChange={(e) => setTipoProducto(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="fungible">Fungible</option>
            <option value="inventariable">Inventariable</option>
          </select>
          <textarea
            placeholder="Comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
          <button 
            type="submit" 
            className="mt-4 p-2 bg-red-600 text-white rounded hover:bg-red-700"
            disabled={loading}
          >
            {loading ? "Procesando..." : "Agregar Orden"}
          </button>
        </div>
      </form>

      {loading && <p className="text-center">Cargando...</p>}

      {ordenesCompra.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-red-100 text-red-600 text-sm">
              <tr>
                <th className="px-4 py-2 border">Código</th>
                <th className="px-4 py-2 border">Inversión</th>
                <th className="px-4 py-2 border">Tipo</th>
                <th className="px-4 py-2 border">Fecha</th>
                <th className="px-4 py-2 border">Gasto</th>
                <th className="px-4 py-2 border">Usuario</th>
                <th className="px-4 py-2 border">Departamento</th>
                <th className="px-4 py-2 border">Proveedor</th>
                <th className="px-4 py-2 border">Comentario</th>
                {canDelete() && <th className="px-4 py-2 border">Acciones</th>}
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {ordenesCompra.map((orden) => (
                <tr key={orden.Id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 border">{orden.Codigo}</td>
                  <td className="px-4 py-2 border">{orden.NumeroInversion}</td>
                  <td className="px-4 py-2 border">{orden.Tipo}</td>
                  <td className="px-4 py-2 border">{new Date(orden.Fecha).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border">{orden.Gasto} €</td>
                  <td className="px-4 py-2 border">{orden.nombre_usuario}</td>
                  <td className="px-4 py-2 border">{orden.nombre_departamento}</td>
                  <td className="px-4 py-2 border">{orden.nombre_proveedor}</td>
                  <td className="px-4 py-2 border">{orden.Comentario}</td>
                  {canDelete() && (
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => handleDelete(orden.Id)}
                        className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                        disabled={loading}
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 mt-6">No hay órdenes registradas.</p>
      )}
    </div>
  );
}