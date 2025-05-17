import { NextResponse } from "next/server";
import { pool } from "@/app/api/lib/db";
import {
  getProveedores,
  addProveedor,
  deleteProveedor,
} from "@/app/api/functions/select";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

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

export async function POST(req) {
  try {
    const { nombre } = await req.json();
    if (!nombre || !nombre.trim()) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }
    // Inserta el proveedor y devuelve el nuevo registro
    const [result] = await pool.query(
      "INSERT INTO proveedores (nombre) VALUES (?)",
      [nombre.trim()]
    );
    const [nuevoProveedor] = await pool.query(
      "SELECT * FROM proveedores WHERE Id_Proveedor = ?",
      [result.insertId]
    );
    return NextResponse.json(nuevoProveedor[0]);
  } catch (error) {
    console.error("Error adding proveedor:", error);
    return NextResponse.json(
      { error: "Error al añadir proveedor" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { nombre } = await req.json();
    if (!nombre) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }
    await pool.query("DELETE FROM proveedores WHERE nombre = ?", [nombre]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting proveedor:", error);
    return NextResponse.json(
      { error: "Error al eliminar proveedor" },
      { status: 500 }
    );
  }
}
