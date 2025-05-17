import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { pool } from '@/app/api/lib/db';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const pdf = formData.get('pdf');
    const ordenId = formData.get('ordenId');

    if (!pdf || !ordenId) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const bytes = await pdf.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear nombre único para el archivo
    const fileName = `factura_${ordenId}_${Date.now()}.pdf`;
    const filePath = path.join(process.cwd(), 'public', 'facturas', fileName);

    // Guardar archivo
    await writeFile(filePath, buffer);

    // Guardar referencia en base de datos
    await pool.query(
      'INSERT INTO FACTURA (PDF, Id_ordenCompra) VALUES (?, ?)',
      [fileName, ordenId]
    );

    return NextResponse.json({ success: true, fileName });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 });
  }
}

export async function GET(req) {
  const ordenId = req.url.split('/').pop();
  
  try {
    const [facturas] = await pool.query(
      'SELECT PDF FROM FACTURA WHERE Id_ordenCompra = ? ORDER BY Id_factura DESC LIMIT 1',
      [ordenId]
    );

    if (facturas.length === 0) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ pdfPath: facturas[0].PDF });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error al obtener la factura' }, { status: 500 });
  }
}
