import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { pool } from "@/app/api/lib/db";

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userRole = session.user.role;
    if (userRole !== "Jefe_Departamento" && userRole !== "Administrador") {
      return NextResponse.json({ error: "No tienes permiso para eliminar órdenes" }, { status: 403 });
    }

    // Eliminar registros relacionados primero
    await pool.query('DELETE FROM oc_inversion WHERE Id_OrderCompra = ?', [id]);

    // Eliminar la orden
    await pool.query('DELETE FROM orden_compra WHERE Id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar:", error);
    if (error.errno === 1451) {
      return NextResponse.json({
        error: "No puedes eliminar esta orden porque tiene datos relacionados."
      }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al eliminar la orden" }, { status: 500 });
  }
}
