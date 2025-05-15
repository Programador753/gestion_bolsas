import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from '../auth/[...nextauth]/route';
import { pool } from "@/app/api/lib/db";

export async function DELETE(request, { params }) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);
    
    // Si no hay sesión, rechazar
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    // Verificar si el usuario es Jefe de Departamento
    const userRole = session.user.role; // Asume que tienes 'role' en la sesión
    if (userRole !== "jefeDepartamento" && userRole !== "Administrador") {
      return NextResponse.json({ error: "No tienes permiso para eliminar órdenes" }, { status: 403 });
    }
    
    // Si tiene permiso, proceder con la eliminación
    const id = params.id;
    const query = 'DELETE FROM ordenes_compra WHERE Id = ?';
    await pool.query(query, [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar:", error);
    return NextResponse.json({ error: "Error al eliminar la orden" }, { status: 500 });
  }
}