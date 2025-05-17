import { NextResponse } from 'next/server';
import { pool } from '@/app/api/lib/db';

export async function GET(req, { params }) {
  // Asegurarte de que params esté resuelto correctamente antes de acceder a sus propiedades
  const { id } = await params;  // Aquí se hace la espera de params si es necesario
  const idProveedor = id;
  
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
