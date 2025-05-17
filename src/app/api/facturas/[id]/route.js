import { NextResponse } from "next/server";
import { pool } from "@/app/api/lib/db";
import { unlink } from 'fs/promises';
import path from 'path';

export async function GET(req, { params }) {
  const { id } = await params;

  try {
    const [facturas] = await pool.query(
      'SELECT PDF FROM FACTURA WHERE Id_ordenCompra = ? ORDER BY Id_factura DESC LIMIT 1',
      [id]
    );

    return NextResponse.json({ 
      pdfPath: facturas[0]?.PDF || null,
      exists: facturas.length > 0
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener la factura' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;

  try {
    // Primero obtener la información de la factura
    const [facturas] = await pool.query(
      'SELECT PDF FROM FACTURA WHERE Id_ordenCompra = ?',
      [id]
    );

    if (facturas.length === 0) {
      return NextResponse.json(
        { error: 'No hay factura para eliminar' },
        { status: 404 }
      );
    }

    const fileName = facturas[0].PDF;
    const filePath = path.join(process.cwd(), 'public', 'facturas', fileName);

    // Eliminar el archivo físico
    try {
      await unlink(filePath);
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      // Continuamos incluso si el archivo no existe
    }

    // Eliminar el registro de la base de datos
    await pool.query('DELETE FROM FACTURA WHERE Id_ordenCompra = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la factura' },
      { status: 500 }
    );
  }
}
