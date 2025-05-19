import { NextResponse } from "next/server";
import { pool } from "@/app/api/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const departamentoId = searchParams.get("departamento");

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    let query = `
      SELECT DISTINCT P.* 
      FROM PROVEEDORES P
      JOIN PROVEEDOR_DEPARTAMENTO PD ON P.Id_Proveedor = PD.Id_Proveedor
    `;
    const params = [];

    // Aplicar filtro por departamento si:
    // - Es Jefe_Departamento (usar su Id_Departamento asignado)
    // - Es Administrador y seleccionó un departamento específico
    if (session.user?.role === "Jefe_Departamento") {
      query += ` WHERE PD.Id_Departamento = ?`;
      params.push(session.user.Id_Departamento);
    } else if (departamentoId) {
      query += ` WHERE PD.Id_Departamento = ?`;
      params.push(departamentoId);
    }

    query += ` ORDER BY P.nombre`;
    const [proveedores] = await pool.query(query, params);

    return NextResponse.json({ proveedores });
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}