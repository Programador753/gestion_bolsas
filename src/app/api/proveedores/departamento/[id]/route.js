import { NextResponse } from 'next/server';
import { pool } from '@/app/api/lib/db';

export async function GET(req, { params }) {
  const idDepartamento = params.id;
  try {
    const [rows] = await pool.query(
      `SELECT p.* 
       FROM proveedores p
       JOIN PROVEEDOR_DEPARTAMENTO pd ON p.Id_Proveedor = pd.Id_Proveedor
       WHERE pd.Id_Departamento = ?`,
      [idDepartamento]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching proveedores por departamento:', error);
    return NextResponse.json({ error: 'Error fetching proveedores por departamento' }, { status: 500 });
  }
}