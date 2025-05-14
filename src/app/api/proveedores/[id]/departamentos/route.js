import { NextResponse } from 'next/server';
import { pool } from '@/app/api/lib/db';

export async function GET(req, { params }) {
  const idProveedor = params.id;
  try {
    const [rows] = await pool.query(
      'SELECT Id_Departamento FROM PROVEEDOR_DEPARTAMENTO WHERE Id_Proveedor = ?',
      [idProveedor]
    );
    const ids = rows.map(row => row.Id_Departamento);
    return NextResponse.json(ids);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener departamentos relacionados' }, { status: 500 });
  }
}