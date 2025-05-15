import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from '../auth/[...nextauth]/route';
import { pool } from "@/app/api/lib/db";

// Obtener las órdenes de compra
export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Buscar usuario en base de datos por su email
    const [usuarios] = await pool.query(
      "SELECT * FROM USUARIO WHERE email = ?",
      [session.user.email]
    );
    const usuario = usuarios[0];

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no registrado" },
        { status: 403 }
      );
    }

    let query = `
      SELECT 
        oc.Id,
        oc.Codigo,
        oc.NumeroInversion,
        oc.Tipo,
        oc.Fecha,
        oc.Comentario,
        oc.Gasto,
        oc.es_fungible,
        oc.es_inventariado,
        u.nombre AS nombre_usuario,
        d.nombre AS nombre_departamento,
        p.nombre AS nombre_proveedor
      FROM ORDEN_COMPRA oc
      JOIN USUARIO u ON oc.Id_Usuario = u.Id_Usuario
      JOIN DEPARTAMENTO d ON u.Id_Departamento = d.Id_Departamento
      JOIN PROVEEDORES p ON oc.Id_Proveedor = p.Id_Proveedor
    `;
    let params = [];

    if (usuario.rol === "Jefe_Departamento" || usuario.rol === "Administrador") {
      query += " WHERE u.Id_Departamento = ?";
      params.push(usuario.Id_Departamento);
    }

    const [ordenes] = await pool.query(query, params);

    return NextResponse.json({ ordenes });
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// Agregar una nueva orden de compra
export async function POST(req) {
  const {
    Codigo,
    NumeroInversion,
    Tipo,
    Fecha,
    Gasto,
    Comentario,
    Id_Proveedor,
    es_fungible,
    es_inventariado,
  } = await req.json();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const [usuarios] = await pool.query(
      "SELECT * FROM USUARIO WHERE email = ?",
      [session.user.email]
    );
    const usuario = usuarios[0];

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no registrado" },
        { status: 403 }
      );
    }

    const query = `
      INSERT INTO ORDEN_COMPRA (Codigo, NumeroInversion, Tipo, Fecha, Gasto, Comentario, Id_Usuario, Id_Proveedor, es_fungible, es_inventariado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      Codigo,
      NumeroInversion,
      Tipo,
      Fecha,
      Gasto,
      Comentario,
      usuario.Id_Usuario,
      Id_Proveedor,
      es_fungible,
      es_inventariado,
    ]);

    const newOrden = {
      Id: result.insertId,
      Codigo,
      NumeroInversion,
      Tipo,
      Fecha,
      Gasto,
      Comentario,
      es_fungible,
      es_inventariado,
      nombre_usuario: usuario.nombre,
      nombre_departamento: usuario.departamento.nombre,
      nombre_proveedor: (
        await pool.query(
          "SELECT nombre FROM PROVEEDORES WHERE Id_Proveedor = ?",
          [Id_Proveedor]
        )
      )[0][0].nombre,
    };

    return NextResponse.json({ orden: newOrden });
  } catch (error) {
    console.error("Error al agregar orden:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// Obtener los proveedores
export async function GET_PROVEEDORES(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Obtener proveedores desde la base de datos
    const [proveedores] = await pool.query("SELECT * FROM PROVEEDORES");

    return NextResponse.json({ proveedores });
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

  
