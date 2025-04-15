import { pool } from '@/app/api/lib/db';

export async function getDepartamentos() {
  try {
    const [rows] = await pool.query('SELECT * FROM departamento');
    return rows;
  } catch (error) {
    console.error('Error fetching departamentos:', error);
    throw error;
  }
}
export async function getBolsas() {
  try {
    const [rows] = await pool.query('SELECT * FROM bolsas');
    return rows;
  } catch (error) {
    console.error('Error fetching bolsas:', error);
    throw error;
  }
}