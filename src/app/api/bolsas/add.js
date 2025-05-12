//ESTE ARCHIVO SIRVE PARA AÑADIR UNA NUEVA BOLSA A LA BASE DE DATOS
import { pool } from '@/app/api/lib/db';

export async function POST(req) {
  try {
    const { departamento, anio, monto, tipoBolsa } = await req.json();

    // Insert the new bolsa into the database
    const query = `
      INSERT INTO BOLSA (Departamento, Anio, Monto, Tipo_Bolsa)
      VALUES (?, ?, ?, ?)
    `;
    await pool.query(query, [departamento, anio, monto, tipoBolsa]);

    return new Response(JSON.stringify({ message: 'Bolsa añadida exitosamente' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error adding bolsa:', error);
    return new Response(JSON.stringify({ error: 'Error al añadir la bolsa (api/bolsas/add.js)' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
