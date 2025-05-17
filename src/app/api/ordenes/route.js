import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { pool } from "@/app/api/lib/db";

// GET: Obtener órdenes de compra
export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Obtener usuario junto con nombre departamento
    const [usuarios] = await pool.query(`
      SELECT u.*, d.nombre AS nombre_departamento 
      FROM USUARIO u
      LEFT JOIN DEPARTAMENTO d ON u.Id_Departamento = d.Id_Departamento
      WHERE u.email = ?
    `, [session.user.email]);
    
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

    const params = [];

    // Solo limitar para Jefe_Departamento, administrador ve todo
    if (usuario.rol === "Jefe_Departamento") {
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

// POST: Crear nueva orden de compra
export async function POST(req) {
  const {
    Codigo,
    NumeroInversion,    // solo para saber si hay inversión
    Id_Binversion,      // ESTE ES EL ID REAL QUE HAY QUE USAR en OC_INVERSION
    Tipo,
    Fecha,
    Gasto,
    Comentario,
    Id_Proveedor,
    es_fungible,
    es_inventariado,
    Id_B_Presupuesto // para presupuesto
  } = await req.json();

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const [usuarios] = await pool.query(`
      SELECT u.*, d.nombre AS nombre_departamento
      FROM USUARIO u
      LEFT JOIN DEPARTAMENTO d ON u.Id_Departamento = d.Id_Departamento
      WHERE u.email = ?
    `, [session.user.email]);
    const usuario = usuarios[0];

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no registrado" },
        { status: 403 }
      );
    }

    const queryInsertOrden = `
      INSERT INTO ORDEN_COMPRA (Codigo, NumeroInversion, Tipo, Fecha, Gasto, Comentario, Id_Usuario, Id_Proveedor, es_fungible, es_inventariado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Validar y formatear fecha a yyyy-mm-dd
    let fechaVal = null;
    try {
      fechaVal = new Date(Fecha).toISOString().slice(0, 10);
    } catch {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
    }

    // Si NumeroInversion no es número válido, usar 0
    const numeroInversionVal = Number(NumeroInversion) > 0 ? Number(NumeroInversion) : 0;

    const [result] = await pool.query(queryInsertOrden, [
      Codigo,
      numeroInversionVal,
      Tipo,
      fechaVal,
      Gasto,
      Comentario,
      usuario.Id_Usuario,
      Id_Proveedor,
      es_fungible ? 'Y' : 'N',
      es_inventariado ? 'Y' : 'N',
    ]);

    const newOrdenId = result.insertId;

    // Insertar inversión si aplica
    if (numeroInversionVal > 0) {
      if (!Id_Binversion || Number(Id_Binversion) <= 0) {
        return NextResponse.json({ error: "Falta Id_Binversion válido para la inversión" }, { status: 400 });
      }

      const [inversionRows] = await pool.query(
        'SELECT Id FROM B_INVERSION WHERE Id = ?',
        [Id_Binversion]
      );

      if (inversionRows.length === 0) {
        return NextResponse.json(
          { error: `No existe inversión con Id ${Id_Binversion}` },
          { status: 400 }
        );
      }

      await pool.query(
        `INSERT INTO OC_INVERSION (Id_OrderCompra, Id_Binversion) VALUES (?, ?)`,
        [newOrdenId, Id_Binversion]
      );
    } else if (Id_B_Presupuesto) {
      // Insertar presupuesto si aplica
      const [presupuestoRows] = await pool.query(
        'SELECT Id FROM B_PRESUPUESTO WHERE Id = ?',
        [Id_B_Presupuesto]
      );

      if (presupuestoRows.length === 0) {
        return NextResponse.json(
          { error: `No existe presupuesto con Id ${Id_B_Presupuesto}` },
          { status: 400 }
        );
      }

      await pool.query(
        `INSERT INTO OC_PRESUPUESTO (Id_OrderCompra, Id_B_Presupuesto) VALUES (?, ?)`,
        [newOrdenId, Id_B_Presupuesto]
      );
    }

    // Obtener nombre proveedor
    const [[proveedor]] = await pool.query(
      "SELECT nombre FROM PROVEEDORES WHERE Id_Proveedor = ?",
      [Id_Proveedor]
    );

    const newOrden = {
      Id: newOrdenId,
      Codigo,
      NumeroInversion: numeroInversionVal,
      Tipo,
      Fecha: fechaVal,
      Gasto,
      Comentario,
      es_fungible: es_fungible ? 'Y' : 'N',
      es_inventariado: es_inventariado ? 'Y' : 'N',
      nombre_usuario: usuario.nombre,
      nombre_departamento: usuario.nombre_departamento || null,
      nombre_proveedor: proveedor?.nombre || null,
    };

    return NextResponse.json({ orden: newOrden });

  } catch (error) {
    console.error("Error al agregar orden:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}


// Método especial para obtener proveedores
export async function GET_PROVEEDORES(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const [proveedores] = await pool.query("SELECT * FROM PROVEEDORES");
    return NextResponse.json({ proveedores });
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}