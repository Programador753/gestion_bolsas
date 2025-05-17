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
      JOIN DEPARTAMENTO d ON oc.Id_Departamento = d.Id_Departamento
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
    Id_B_Presupuesto, // para presupuesto
    Id_Departamento   // <-- Añade aquí el campo que faltaba
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

    // Validar y formatear fecha a yyyy-mm-dd
    let fechaVal = null;
    try {
      fechaVal = new Date(Fecha).toISOString().slice(0, 10);
    } catch {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
    }

    // Si NumeroInversion no es número válido, usar 0
    const numeroInversionVal = Number(NumeroInversion) > 0 ? Number(NumeroInversion) : 0;

    // Validar Id_Departamento antes de insertar la orden
    // Si es jefe de departamento, forzar el departamento del usuario
    let idDepartamentoFinal = Id_Departamento;
    if (usuario.rol === "Jefe_Departamento") {
      idDepartamentoFinal = usuario.Id_Departamento;
    }
    if (!idDepartamentoFinal || isNaN(Number(idDepartamentoFinal))) {
      return NextResponse.json(
        { error: "El departamento seleccionado no es válido." },
        { status: 400 }
      );
    }

    // Validar y preparar Id_Binversion y Id_B_Presupuesto
    let idBinversionFinal = null;
    let idPresupuestoFinal = null;
    const yearOrden = new Date(Fecha).getFullYear();

    if (numeroInversionVal > 0) {
      // Lógica para inversión
      const [binversiones] = await pool.query(
        `SELECT bi.Id 
         FROM B_INVERSION bi
         JOIN BOLSA b ON bi.Id_Bolsa = b.Id
         WHERE b.Id_Departamento = ? AND b.Anio = ?
         LIMIT 1`,
        [idDepartamentoFinal, yearOrden]
      );

      if (binversiones.length === 0) {
        return NextResponse.json(
          { error: `No hay bolsa de inversión disponible para el departamento en el año ${yearOrden}` },
          { status: 400 }
        );
      }

      idBinversionFinal = binversiones[0].Id;
    } else {
      // Si no hay inversión, buscar presupuesto
      const [presupuestos] = await pool.query(
        `SELECT bp.Id
         FROM B_PRESUPUESTO bp
         JOIN BOLSA b ON bp.Id_Bolsa = b.Id
         WHERE b.Id_Departamento = ? AND b.Anio = ?
         LIMIT 1`,
        [idDepartamentoFinal, yearOrden]
      );

      if (presupuestos.length === 0) {
        return NextResponse.json(
          { error: `No hay bolsa de presupuesto disponible para el departamento en el año ${yearOrden}` },
          { status: 400 }
        );
      }

      idPresupuestoFinal = presupuestos[0].Id;
    }

    // Insertar en ORDEN_COMPRA_TEMP
    const queryInsertOrden = `
      INSERT INTO ORDEN_COMPRA_TEMP
      (Codigo, NumeroInversion, Tipo, Fecha, Gasto, Comentario, Id_Usuario, Id_Proveedor, 
       es_fungible, es_inventariado, Id_Departamento, Id_Binversion, Id_B_Presupuesto)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

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
      idDepartamentoFinal,
      idBinversionFinal,  // Usar el valor procesado
      idPresupuestoFinal  // Usar el valor procesado
    ]);

    const newOrdenId = result.insertId;

    // Ya no necesitamos insertar manualmente en OC_INVERSION u OC_PRESUPUESTO
    // El trigger se encargará de eso

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