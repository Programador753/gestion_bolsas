import { NextResponse } from 'next/server';
import { getDepartamentos } from '@/app/api/functions/select';
import { addDepartamento } from '@/app/api/functions/select';

export async function GET() {
  try {
    const departamentos = await getDepartamentos();
    return NextResponse.json(departamentos);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Error al obtener departamentos' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { nombre } = await request.json();
    if (!nombre || !nombre.trim()) {
      return NextResponse.json({ error: 'Nombre de departamento requerido' }, { status: 400 });
    }
    await addDepartamento(nombre.trim());
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Error al añadir departamento' }, { status: 500 });
  }
}
