'use client'; // Indica que este componente es cliente en Next.js

import React, { useState, useEffect } from 'react'; // Importa React y hooks
import { use } from 'react'; // Importa el hook use (no es común, se explica abajo)

export default function Page({ params }) { // Componente principal que recibe los parámetros de la ruta
  // Usar React.use() para acceder a los parámetros (no es habitual, normalmente se usa directamente params)
  const parameters = use(params);
  const { slug, departamento, anio } = parameters; // Extrae los parámetros de la URL

  const decodedDepartamento = decodeURIComponent(departamento); // Decodifica el nombre del departamento
  const decodedSlug = decodeURIComponent(slug); // Decodifica el tipo de bolsa
  const normalizedSlug = decodedSlug.replace('Inversión', 'Inversion'); // Normaliza el nombre del tipo de bolsa

  // Estados para almacenar datos y estado de facturas
  const [datos, setDatos] = useState([]); // Lista de órdenes de compra
  const [facturaStatus, setFacturaStatus] = useState({}); // Estado de existencia de factura por orden

  // Función para obtener los datos de las órdenes de compra
  const fetchDatos = async () => {
    try {
      const searchParams = new URLSearchParams({
        departamento: decodedDepartamento,
        anio: anio,
        tipo: normalizedSlug,
      });
      const res = await fetch(`/api/bolsas/desglose?${searchParams}`);
      const data = await res.json();
      setDatos(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Verifica si existe factura para una orden
  const checkFactura = async (ordenId) => {
    try {
      const res = await fetch(`/api/facturas/${ordenId}`);
      const data = await res.json();
      setFacturaStatus(prev => ({...prev, [ordenId]: data.exists}));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Maneja la subida de archivos PDF de factura
  const handleFileUpload = async (e, ordenId) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Por favor, seleccione un archivo PDF válido');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('ordenId', ordenId);

    try {
      const res = await fetch('/api/facturas/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al subir la factura');
      }

      alert('Factura subida correctamente');
      await fetchDatos(); // Recarga los datos tras subir la factura
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Error al subir la factura');
    }
  };

  // Muestra el PDF de la factura en una nueva ventana
  const handleViewPdf = async (ordenId) => {
    try {
      const res = await fetch(`/api/facturas/${ordenId}`);
      const data = await res.json();
      
      if (res.ok && data.pdfPath) {
        // Construye la URL completa para abrir el PDF
        const baseUrl = window.location.origin;
        window.open(`${baseUrl}/facturas/${data.pdfPath}`, '_blank');
      } else {
        alert(data.error || 'No se encontró la factura');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al obtener la factura');
    }
  };

  // Elimina la factura asociada a una orden
  const handleDeleteFactura = async (ordenId) => {
    if (!confirm('¿Está seguro de eliminar la factura?')) return;
    
    try {
      const res = await fetch(`/api/facturas/${ordenId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setFacturaStatus(prev => ({...prev, [ordenId]: false}));
        alert('Factura eliminada correctamente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la factura');
    }
  };

  // Elimina una orden de compra
  const handleDeleteOrden = async (ordenId) => {
    if (!confirm('¿Está seguro de eliminar esta orden de compra?')) return;
    
    try {
      const res = await fetch(`/api/ordenes/${ordenId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDatos(datos.filter(orden => orden.Id !== ordenId));
        alert('Orden eliminada correctamente');
      } else {
        throw new Error('Error al eliminar la orden');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la orden');
    }
  };

  // useEffect para cargar datos cuando cambian los parámetros principales
  useEffect(() => {
    fetchDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decodedDepartamento, anio, normalizedSlug]);

  // useEffect para verificar el estado de las facturas cuando cambian los datos
  useEffect(() => {
    datos.forEach(orden => checkFactura(orden.Id));
  }, [datos]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-white">
      <main className="flex-grow px-4 py-10 w-full max-w-5xl">
        {/* Título */}
        <h1 className="text-center text-3xl font-extrabold text-red-700 mb-8">
          {normalizedSlug.toUpperCase()} – {decodedDepartamento} ({anio})
        </h1>

        {/* Tabla o mensaje vacío */}
        {datos && datos.length > 0 ? (
          <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
            <table className="min-w-full table-auto text-sm text-gray-700">
              <thead className="bg-red-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Código</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Proveedor</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-right">Gasto (€)</th>
                  <th className="px-4 py-3 text-left">Comentario</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((orden, idx) => (
                  <tr
                    key={orden.Id}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-red-50'}
                  >
                    <td className="px-4 py-3">{orden.Codigo}</td>
                    <td className="px-4 py-3">{orden.Tipo}</td>
                    <td className="px-4 py-3">{orden.nombre_proveedor}</td>
                    <td className="px-4 py-3">
                      {new Date(orden.Fecha).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {orden.Gasto.toLocaleString('es-ES', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </td>
                    <td className="px-4 py-3">{orden.Comentario}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col space-y-2">
                        {/* Botones de Factura */}
                        {!facturaStatus[orden.Id] ? (
                          <>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => handleFileUpload(e, orden.Id)}
                              className="hidden"
                              id={`upload-${orden.Id}`}
                            />
                            <button
                              onClick={() => document.getElementById(`upload-${orden.Id}`).click()}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm w-full flex items-center justify-center gap-2"
                            >
                              {/* Icono de subir */}
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              Subir Factura
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleViewPdf(orden.Id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2"
                            >
                              {/* Icono de ver */}
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver PDF
                            </button>
                            <button
                              onClick={() => handleDeleteFactura(orden.Id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2"
                            >
                              {/* Icono de eliminar */}
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Eliminar Factura
                            </button>
                          </>
                        )}
                        {/* Botón Eliminar Orden */}
                        <button
                          onClick={() => handleDeleteOrden(orden.Id)}
                          className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2 mt-2"
                        >
                          {/* Icono de eliminar */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Eliminar Orden
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-6">
            No se encontraron órdenes de compra.
          </p>
        )}
      </main>
    </div>
  );
}
