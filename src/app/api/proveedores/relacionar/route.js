import { NextResponse } from 'next/server';
import { pool } from '@/app/api/lib/db';

export async function POST(req) {
  try {
    const { idProveedor, departamentos } = await req.json();

    // Elimina relaciones antiguas
    await pool.query('DELETE FROM PROVEEDOR_DEPARTAMENTO WHERE Id_Proveedor = ?', [idProveedor]);

    // Inserta nuevas relaciones
    if (departamentos.length > 0) {
      const values = departamentos.map(depId => [idProveedor, depId]);
      await pool.query(
        'INSERT INTO PROVEEDOR_DEPARTAMENTO (Id_Proveedor, Id_Departamento) VALUES ?',
        [values]
      );
    }

    return NextResponse.json({ message: 'Relaciones actualizadas' });
  } catch (error) {
    console.error('Error actualizando relaciones:', error);
    return NextResponse.json({ error: 'Error actualizando relaciones' }, { status: 500 });
  }
}