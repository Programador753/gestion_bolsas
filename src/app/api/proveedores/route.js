// src/app/api/proveedores/route.js

import { getProveedores } from '@/lib/database/functions'; // Asegúrate de que esta ruta sea válida

export async function GET() {
  try {
    const proveedores = await getProveedores();
    return Response.json(proveedores);
  } catch (error) {
    return new Response('Error al obtener proveedores', { status: 500 });
  }
}
