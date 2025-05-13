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
  const [esFungible, setEsFungible] = useState("N");
  const [esInventariado, setEsInventariado] = useState("N");

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const res = await fetch("/api/ordenes");
        const data = await res.json();
        if (res.ok) {
          setOrdenesCompra(data.ordenes || []);
        } else {
          console.error("Error:", data.error);
        }
      } catch (err) {
        console.error("Error al cargar órdenes:", err);
      }
    };

    const fetchProveedores = async () => {
      try {
        const res = await fetch("/api/proveedores");
        const data = await res.json();
        if (res.ok) {
          setProveedores(data.proveedores || []);
        } else {
          console.error("Error:", data.error);
        }
      } catch (err) {
        console.error("Error al cargar proveedores:", err);
      }
    };

    if (status === "authenticated") {
      fetchOrdenes();
      fetchProveedores();
    }
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newOrden = {
      Codigo: codigo,
      NumeroInversion: numeroInversion,
      Tipo: tipo,
      Fecha: fecha,
      Gasto: gasto,
      Comentario: comentario,
      Id_Proveedor: proveedor,
      es_fungible: esFungible,
      es_inventariado: esInventariado,
    };

    try {
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
      } else {
        console.error("Error:", data.error);
      }
    } catch (err) {
      console.error("Error al agregar orden:", err);
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
    setEsFungible("N");
    setEsInventariado("N");
  };

  return (
    <div className="p-8 bg-white text-black rounded shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-red-800">Órdenes de Compra</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <h2 className="text-xl font-semibold text-red-800 mb-4">Agregar Orden de Compra</h2>
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
            required
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
          <textarea
            placeholder="Comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
          <select
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
            className="p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Selecciona Proveedor</option>
            {proveedores.map((prov) => (
              <option key={prov.Id_Proveedor} value={prov.Id_Proveedor}>
                {prov.nombre}
              </option>
            ))}
          </select>
          <select
            value={esFungible}
            onChange={(e) => setEsFungible(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="N">No Fungible</option>
            <option value="S">Fungible</option>
          </select>
          <select
            value={esInventariado}
            onChange={(e) => setEsInventariado(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="N">No Inventariado</option>
            <option value="S">Inventariado</option>
          </select>
          <button type="submit" className="mt-4 p-2 bg-red-800 text-white rounded">
            Agregar Orden
          </button>
        </div>
      </form>

      {ordenesCompra.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-red-100 text-red-800 text-sm">
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
