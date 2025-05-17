import { NextResponse } from "next/server";
import { pool } from "@/app/api/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let departamento = null;
  if (session.user?.role === "Jefe_Departamento") {
    departamento = session.user?.departamento;
  }
  // Si es administrador, departamento queda null, y la consulta debe traer todos.

  try {
    let query = `
      SELECT P.* FROM DEPARTAMENTO AS D
      JOIN PROVEEDOR_DEPARTAMENTO AS PD ON D.Id_Departamento = PD.Id_Departamento
      JOIN PROVEEDORES AS P ON PD.Id_Proveedor = P.Id_Proveedor
    `;
    let params = [];

    if (departamento) {
      query += ` WHERE D.nombre = ?`;
      params.push(departamento);
    }

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