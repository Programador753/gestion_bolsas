import { NextResponse } from 'next/server';
import { getDepartamentos } from '@/app/api/functions/select';
import { addDepartamento } from '@/app/api/functions/select';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { pool } from '@/app/api/lib/db';


export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const [departamentos] = await pool.query("SELECT * FROM DEPARTAMENTO");
    return NextResponse.json({ departamentos });
  } catch (error) {
    console.error("Error al obtener departamentos:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { nombre } = await request.json();
    if (!nombre || !nombre.trim()) { //.trim() elimina los espacios en blanco al inicio y al final de un string
      return NextResponse.json({ error: 'Nombre de departamento requerido' }, { status: 400 });
    }
    await addDepartamento(nombre.trim());
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Error al añadir departamento' }, { status: 500 });
  }
}
