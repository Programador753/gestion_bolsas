import { getBolsas } from "../functions/select";
import { pool } from '@/app/api/lib/db';

export async function GET() {
  try {
    const bolsas = await getBolsas();
    return new Response(JSON.stringify(bolsas), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching bolsas:", error);
    return new Response(JSON.stringify({ error: "Error fetching bolsas" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req) {
  try {
    const { departamento, anio, monto, tipoBolsa } = await req.json();

    // Buscar Id_Departamento por nombre
    const [rows] = await pool.query('SELECT Id_Departamento FROM DEPARTAMENTO WHERE nombre = ?', [departamento]);

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Departamento no encontrado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const idDepartamento = rows[0].Id_Departamento;

    // Insertar en BOLSA
    const insertBolsaQuery = `
      INSERT INTO BOLSA (Id_Departamento, Anio, Inicial)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.query(insertBolsaQuery, [idDepartamento, anio, monto]);

    const idBolsa = result.insertId;

    if (tipoBolsa.toLowerCase() === 'presupuesto') {
      await pool.query('INSERT INTO B_PRESUPUESTO (Id_Bolsa) VALUES (?)', [idBolsa]);
    } else if (tipoBolsa.toLowerCase() === 'inversion') {
      await pool.query('INSERT INTO B_INVERSION (Id_Bolsa) VALUES (?)', [idBolsa]);
    } else {
      return new Response(JSON.stringify({ error: 'Tipo de bolsa inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Bolsa añadida exitosamente' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error adding bolsa:', error);
    return new Response(JSON.stringify({ error: 'Error al añadir la bolsa' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
