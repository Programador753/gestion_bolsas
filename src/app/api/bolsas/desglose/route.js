import { NextResponse } from "next/server";
import { pool } from "@/app/api/lib/db";
import { desgloseGastos } from "@/app/api/functions/select";

export async function GET(req) {
  const searchParams = req.nextUrl.searchParams;
  const departamento = searchParams.get('departamento');
  const anio = searchParams.get('anio');
  const tipo = searchParams.get('tipo');

  try {
    const datos = await desgloseGastos(departamento, anio, tipo);
    return NextResponse.json(datos);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 });
  }
}
