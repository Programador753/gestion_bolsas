import { NextResponse } from 'next/server';
import { getProveedores, addProveedor, deleteProveedor } from '@/app/api/functions/select';

export async function GET() {
  try {
    const proveedores = await getProveedores();
    return NextResponse.json(proveedores);
  } catch (error) {
    console.error('Error fetching proveedores:', error);
    return NextResponse.json({ error: 'Error fetching proveedores' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { nombre } = await req.json();
    console.log('Nombre recibido en API Route:', nombre); // Depuración
    if (!nombre) {
      return NextResponse.json({ error: 'Nombre del proveedor es requerido' }, { status: 400 });
    }
    const nuevoProveedor = await addProveedor(nombre);
    console.log('Proveedor añadido:', nuevoProveedor); // Depuración
    return NextResponse.json(nuevoProveedor);
  } catch (error) {
    console.error('Error adding proveedor:', error);
    return NextResponse.json({ error: 'Error al añadir el proveedor' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { nombre } = await req.json();
    await deleteProveedor(nombre);
    return NextResponse.json({ message: 'Proveedor eliminado con éxito' });
  } catch (error) {
    console.error('Error deleting proveedor:', error);
    return NextResponse.json({ error: 'Error deleting proveedor' }, { status: 500 });
  }
}
