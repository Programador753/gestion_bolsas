"use client"; // Indica que este componente es del lado del cliente

import { useSession } from "next-auth/react"; // Importa hook para sesión de usuario
import { useEffect, useState } from "react"; // Importa hooks de React

export default function OrdenCompraPage() {
  const { data: session } = useSession(); // Obtiene la sesión del usuario
  const [ordenesCompra, setOrdenesCompra] = useState([]); // Estado para órdenes de compra
  const [proveedores, setProveedores] = useState([]); // Estado para proveedores
  const [departamentos, setDepartamentos] = useState([]); // Estado para departamentos

  const [codigo, setCodigo] = useState(""); // Estado para código
  const [numeroInversion, setNumeroInversion] = useState(""); // Estado para número de inversión
  const [tipo, setTipo] = useState(""); // Estado para tipo
  const [fecha, setFecha] = useState(""); // Estado para fecha
  const [gasto, setGasto] = useState(""); // Estado para gasto
  const [comentario, setComentario] = useState(""); // Estado para comentario
  const [proveedor, setProveedor] = useState(""); // Estado para proveedor seleccionado
  const [departamento, setDepartamento] = useState(""); // Estado para departamento seleccionado
  const [tipoProducto, setTipoProducto] = useState("fungible"); // Estado para tipo de producto

  const [loading, setLoading] = useState(false); // Estado de carga general
  const [loadingProveedores, setLoadingProveedores] = useState(false); // Estado de carga de proveedores
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false); // Estado de carga de departamentos

  const canDelete = () => { // Función para saber si el usuario puede eliminar
    return session?.user?.role === "Administrador" || session?.user?.role === "Jefe_Departamento";
  };

  // Detectar roles
  const isJefeDepartamento = session?.user?.role === "Jefe_Departamento";
  const isAdmin = session?.user?.role === "Administrador";

  useEffect(() => {
    fetchOrdenes();
    fetchDepartamentos();

    // Manejo específico para Jefe de Departamento
    if (isJefeDepartamento && session?.user?.departamento) {
      console.log("Seteando departamento para jefe:", session.user.departamento);
      setDepartamento(session.user.departamento);
      fetchProveedoresPorDepartamento(session.user.departamento);
    }
  }, [session, isJefeDepartamento]);

  // Modificar el handler del departamento
  const handleDepartamentoChange = async (e) => {
    const newDepartamento = e.target.value;
    setDepartamento(newDepartamento); // Actualiza el estado del departamento seleccionado
    setProveedor(""); // Resetear proveedor seleccionado

    if (newDepartamento) { // Si hay un departamento seleccionado
      await fetchProveedoresPorDepartamento(newDepartamento); // Carga proveedores de ese departamento
    } else {
      setProveedores([]); // Si no hay, limpia la lista de proveedores
    }
  };

  const fetchOrdenes = async () => { // Función para obtener las órdenes de compra
    setLoading(true); // Activa el estado de carga
    try {
      const res = await fetch("/api/ordenes"); // Llama a la API de órdenes
      const data = await res.json(); // Parsea la respuesta
      setOrdenesCompra(data.ordenes || []); // Actualiza el estado con las órdenes recibidas
    } catch (err) {
      console.error("Error al cargar órdenes:", err); // Muestra error en consola si falla
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  const fetchProveedores = async () => { // Función para obtener todos los proveedores
    setLoadingProveedores(true); // Activa el estado de carga de proveedores
    try {
      const res = await fetch("/api/proveedores/ordenes"); // Llama a la API de proveedores
      const data = await res.json(); // Parsea la respuesta
      setProveedores(data.proveedores || data || []); // Actualiza el estado con los proveedores recibidos
    } catch (err) {
      console.error("Error al cargar proveedores:", err); // Muestra error en consola si falla
    } finally {
      setLoadingProveedores(false); // Desactiva el estado de carga de proveedores
    }
  };

  const fetchProveedoresPorDepartamento = async (depId) => {
    if (!depId) {
      console.log("No hay ID de departamento");
      return;
    }
    
    setLoadingProveedores(true);
    try {
      console.log("Fetching proveedores para departamento:", depId);
      const res = await fetch(`/api/proveedores/ordenes?departamento=${depId}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Error al obtener proveedores');
      
      console.log("Proveedores obtenidos:", data.proveedores);
      setProveedores(data.proveedores || []);
    } catch (err) {
      console.error("Error al cargar proveedores:", err);
      setProveedores([]);
    } finally {
      setLoadingProveedores(false);
    }
  };

  const fetchDepartamentos = async () => {
    setLoadingDepartamentos(true);
    try {
      const res = await fetch("/api/departamentos");
      const data = await res.json();
      // Asegura que siempre sea un array de objetos con nombre y/o Id_Departamento
      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data.departamentos)
          ? data.departamentos
          : [];
      setDepartamentos(lista);
    } catch (err) {
      console.error("Error al cargar departamentos:", err);
    } finally {
      setLoadingDepartamentos(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codigo || !fecha || !gasto || !proveedor || !departamento) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    const newOrden = {
      Codigo: codigo,
      NumeroInversion: numeroInversion,
      Tipo: tipo,
      Fecha: fecha,
      Gasto: gasto,
      Comentario: comentario,
      Id_Proveedor: proveedor,
      Id_Departamento: departamento,  // enviamos departamento
      es_fungible: tipoProducto === "fungible" ? "S" : "N",
      es_inventariable: tipoProducto === "inventariable" ? "S" : "N",
    };

    try {
      setLoading(true);
      const res = await fetch("/api/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrden),
      });

      const data = await res.json();

      if (res.ok) {
        setOrdenesCompra((prev) => [...prev, data.orden]);
        resetForm();
        alert("Orden agregada con éxito");
      } else {
        alert(data.error || "Error al agregar la orden");
      }
    } catch (err) {
      console.error(err);
      alert("Error al agregar la orden");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar esta orden?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ordenes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOrdenesCompra((prev) => prev.filter((orden) => orden.Id !== id));
        alert("Orden eliminada");
      } else {
        alert("Error al eliminar la orden");
      }
    } catch (err) {
      console.error(err);
      alert("Error al eliminar");
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
    if (!isJefeDepartamento) setDepartamento(""); // sólo reset si no es jefe
    setTipoProducto("fungible");
  };

  // Actualizar renderDepartamentoInput para mostrar el valor correcto
  const renderDepartamentoInput = () => {
    if (isJefeDepartamento) {
      const depInfo = departamentos.find(
        d => d.Id_Departamento === Number(session?.user?.Id_Departamento)
      );
      return (
        <input
          type="text"
          value={depInfo?.nombre || ''}
          readOnly
          className="border p-2 rounded bg-gray-200 cursor-not-allowed"
          placeholder="Departamento"
        />
      );
    }

    return (
      <select
        value={departamento}
        onChange={handleDepartamentoChange}
        required
        className="border p-2 rounded"
      >
        <option value="">Selecciona Departamento</option>
        {departamentos.map((dep, index) => (
          <option 
            key={`dep-${dep.Id_Departamento}-${index}`}
            value={dep.Id_Departamento}
          >
            {dep.nombre}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className="flex-grow container mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-red-600 mb-6">Órdenes de Compra</h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <input
          type="text"
          placeholder="Código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Número Inversión"
          value={numeroInversion}
          onChange={(e) => setNumeroInversion(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Gasto"
          value={gasto}
          onChange={(e) => setGasto(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <select
          value={proveedor}
          onChange={(e) => setProveedor(e.target.value)}
          required
          className="border p-2 rounded"
        >
          <option value="">Selecciona Proveedor</option>
          {proveedores.map((prov, index) => (
            <option 
              key={`prov-${prov.Id_Proveedor || prov.id}-${index}`}
              value={prov.Id_Proveedor || prov.id}
            >
              {prov.nombre || prov.name}
            </option>
          ))}
        </select>

        {/* Aquí añadimos el departamento */}
        {renderDepartamentoInput()}

        <select
          value={tipoProducto}
          onChange={(e) => setTipoProducto(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="fungible">Fungible</option>
          <option value="inventariable">Inventariable</option>
        </select>
        <textarea
          placeholder="Comentario"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="border p-2 rounded col-span-1 md:col-span-2"
        />

        <div className="flex flex-col md:flex-row gap-4 col-span-1 md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-lg py-3 rounded"
          >
            {loading ? "Procesando..." : "Agregar Orden"}
          </button>
          <button
            type="button"
            onClick={fetchOrdenes}
            className="bg-black text-white py-2 px-4 rounded text-sm self-center"
          >
            Refrescar
          </button>
        </div>
      </form>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded">
          <thead className="bg-red-100 text-red-700">
            <tr>
              {[
                "Código",
                "Inversión",
                "Tipo",
                "Fecha",
                "Gasto",
                "Usuario",
                "Departamento",
                "Proveedor",
                "Comentario",
              ].map((head) => (
                <th key={head} className="border px-3 py-2 text-left">
                  {head}
                </th>
              ))}
              {canDelete() && (
                <th className="border px-3 py-2 text-left">Acciones</th> // Columna de acciones si el usuario puede eliminar
              )}
            </tr>
          </thead>
          <tbody>
            {ordenesCompra.length === 0 && ( // Si no hay órdenes, muestra mensaje
              <tr>
                <td colSpan={10} className="text-center py-4 text-gray-500">
                  No hay órdenes registradas
                </td>
              </tr>
            )}
            {ordenesCompra.map((orden) => ( // Mapea cada orden de compra a una fila de la tabla
              <tr key={orden.Id} className="hover:bg-gray-50">
                <td className="border px-3 py-1">{orden.Codigo}</td> // Código de la orden
                <td className="border px-3 py-1">{orden.NumeroInversion}</td> // Número de inversión
                <td className="border px-3 py-1">{orden.Tipo}</td> // Tipo de orden
                <td className="border px-3 py-1">
                  {new Date(orden.Fecha).toLocaleDateString()} // Fecha formateada
                </td>
                <td className="border px-3 py-1">{orden.Gasto} €</td> // Gasto de la orden
                <td className="border px-3 py-1">{orden.nombre_usuario}</td> // Usuario que creó la orden
                <td className="border px-3 py-1">{orden.nombre_departamento}</td> // Departamento asociado
                <td className="border px-3 py-1">{orden.nombre_proveedor}</td> // Proveedor asociado
                <td className="border px-3 py-1">{orden.Comentario}</td> // Comentario de la orden
                {canDelete() && ( // Si el usuario puede eliminar, muestra botón Eliminar
                  <td className="border px-3 py-1">
                    <button
                      onClick={() => handleDelete(orden.Id)} // Llama a handleDelete con el ID de la orden
                      className="text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
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
    </div>
  );
}
