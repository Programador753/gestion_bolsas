'use client';
import React, { useState, useEffect } from 'react';
import { use } from 'react';

export default function Page({ params }) {
  // Usar React.use() para acceder a los parámetros
  const parameters = use(params);
  const { slug, departamento, anio } = parameters;

  const decodedDepartamento = decodeURIComponent(departamento);
  const decodedSlug = decodeURIComponent(slug);
  const normalizedSlug = decodedSlug.replace('Inversión', 'Inversion');

  const [datos, setDatos] = useState([]);
  const [facturaStatus, setFacturaStatus] = useState({});

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

  const checkFactura = async (ordenId) => {
    try {
      const res = await fetch(`/api/facturas/${ordenId}`);
      const data = await res.json();
      setFacturaStatus(prev => ({...prev, [ordenId]: data.exists}));
    } catch (error) {
      console.error('Error:', error);
    }
  };

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
      await fetchDatos(); // Ahora fetchDatos está disponible aquí
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Error al subir la factura');
    }
  };

  const handleViewPdf = async (ordenId) => {
    try {
      const res = await fetch(`/api/facturas/${ordenId}`);
      const data = await res.json();
      
      if (res.ok && data.pdfPath) {
        // Usar la URL completa incluyendo el dominio
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

  useEffect(() => {
    fetchDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decodedDepartamento, anio, normalizedSlug]);

  useEffect(() => {
    // Verificar estado de facturas al cargar datos
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
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm w-full"
                          >
                            Subir Factura
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => handleViewPdf(orden.Id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2"
                          >
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
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                          </button>
                        </div>
                      )}
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
