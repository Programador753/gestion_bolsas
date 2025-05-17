import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { pool } from '@/app/api/lib/db';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('pdf');
    const ordenId = formData.get('ordenId');

    if (!file || !ordenId) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'facturas');
    try {
      await writeFile(uploadDir, '');
    } catch (error) {
      // Directorio ya existe
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `factura_${ordenId}_${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    await pool.query(
      'INSERT INTO FACTURA (PDF, Id_ordenCompra) VALUES (?, ?)',
      [fileName, ordenId]
    );

    return NextResponse.json({ success: true, fileName });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error al subir la factura' }, { status: 500 });
  }
}
