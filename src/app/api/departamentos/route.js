import { NextResponse } from 'next/server';
import { getDepartamentos } from '@/app/api/functions/select';

export async function GET() {
  try {
    const departamentos = await getDepartamentos();
    return NextResponse.json(departamentos);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Error al obtener departamentos' }, { status: 500 });
  }
}
