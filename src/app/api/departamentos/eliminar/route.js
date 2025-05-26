import { pool } from '@/lib/db'; // Asegúrate de que esta ruta apunte correctamente a tu conexión MySQL

export async function DELETE(request) {
  try {
    const { nombre } = await request.json();

    if (!nombre) {
      return new Response(JSON.stringify({ error: 'Nombre de departamento requerido' }), { status: 400 });
    }

    await pool.query('DELETE FROM departamentos WHERE nombre = ?', [nombre]);

    return new Response(JSON.stringify({ message: 'Departamento eliminado correctamente' }), { status: 200 });
  } catch (error) {
    console.error('Error eliminando departamento:', error);
    return new Response(JSON.stringify({ error: 'Error eliminando departamento' }), { status: 500 });
  }
}
