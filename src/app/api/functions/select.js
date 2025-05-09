import { pool } from '@/app/api/lib/db';

export async function getDepartamentos() {
  try {
    const [rows] = await pool.query('SELECT * FROM departamento');
    return rows;
  } catch (error) {
    console.error('Error fetching departamentos:', error);
    throw error;
  }
}

export async function getBolsas() {
  try {
    const [rows] = await pool.query(`
      SELECT
        d.nombre AS Departamento,
        b.Anio,
        b.Inicial AS Monto,
        CASE
          WHEN bi.Id IS NOT NULL THEN 'Inversión'
          WHEN bp.Id IS NOT NULL THEN 'Presupuesto'
          ELSE 'Sin Asignar'
        END AS Tipo_Bolsa
      FROM DEPARTAMENTO d
      LEFT JOIN BOLSA b ON d.Id_Departamento = b.Id_Departamento
      LEFT JOIN B_INVERSION bi ON b.Id = bi.Id_Bolsa
      LEFT JOIN B_PRESUPUESTO bp ON b.Id = bp.Id_Bolsa
      ORDER BY d.nombre, b.Anio DESC;
    `);
    return rows;
  }
  catch (error) {
    console.error('Error fetching bolsas:', error);
    throw error;
  }
}

export async function getBolsasByDepartamento(departamento) {
  try {
    const [rows] = await pool.query(`
      SELECT
        d.nombre AS Departamento,
        b.Anio,
        b.Inicial AS Monto,
        CASE
          WHEN bi.Id IS NOT NULL THEN 'Inversión'
          WHEN bp.Id IS NOT NULL THEN 'Presupuesto'
          ELSE 'Sin Asignar'
        END AS Tipo_Bolsa
      FROM DEPARTAMENTO d
      LEFT JOIN BOLSA b ON d.Id_Departamento = b.Id_Departamento
      LEFT JOIN B_INVERSION bi ON b.Id = bi.Id_Bolsa
      LEFT JOIN B_PRESUPUESTO bp ON b.Id = bp.Id_Bolsa
      WHERE d.nombre = ?
      ORDER BY b.Anio DESC;
    `, [departamento]); // Usamos el nombre del departamento directamente en la consulta
    return rows;
  }
  catch (error) {
    console.error('Error fetching bolsas by departamento:', error);
    throw error;
  }
}

export async function desgloseGastos(departamento, anio, tipoBolsa) {
  try {
    // Normalizamos el tipo de bolsa
    const tipo = tipoBolsa.toLowerCase();

    // Definimos las tablas y campos en función del tipo de bolsa
    let joinTabla, tipoColumna, campoBolsa;
    if (tipo === 'inversion') {
      joinTabla = 'OC_INVERSION';
      tipoColumna = 'B_INVERSION';
      campoBolsa = 'Id_Binversion';
    } else if (tipo === 'presupuesto') {
      joinTabla = 'OC_PRESUPUESTO';
      tipoColumna = 'B_PRESUPUESTO';
      campoBolsa = 'Id_B_Presupuesto';
    } else {
      throw new Error(`Tipo de bolsa no válido: ${tipoBolsa}`);
    }

    // Ejecutamos la consulta
    const [rows] = await pool.query(`
      SELECT 
        oc.*,
        p.nombre as nombre_proveedor
      FROM ORDEN_COMPRA oc
      JOIN ${joinTabla} rel ON oc.Id = rel.Id_OrderCompra
      JOIN ${tipoColumna} bolsa_tipo ON rel.${campoBolsa} = bolsa_tipo.Id
      JOIN BOLSA b ON bolsa_tipo.Id_Bolsa = b.Id
      JOIN DEPARTAMENTO d ON d.Id_Departamento = b.Id_Departamento
      JOIN PROVEEDORES p ON oc.Id_Proveedor = p.Id_Proveedor
      WHERE d.Nombre = ? AND b.Anio = ?
    `, [decodeURIComponent(departamento), anio]);

    return rows;
  } catch (error) {
    console.error('❌ Error fetching desglose gastos:', error.message);
    throw error;
  }
}

export async function getProveedores() {
  try {
    const [rows] = await pool.query('SELECT * FROM proveedores');
    return rows;
  } catch (error) {
    console.error('Error fetching departamentos:', error);
    throw error;
  }
}

export async function getProveedores() {
  try {
    const [rows] = await pool.query('SELECT * FROM proveedores');
    return rows;
  } catch (error) {
    console.error('Error fetching departamentos:', error);
    throw error;
  }
}

export async function getProveedores() {
  try {
    const [rows] = await pool.query('SELECT * FROM proveedores');
    return rows;
  } catch (error) {
    console.error('Error fetching departamentos:', error);
    throw error;
  }
}

export async function getOrdenCompra() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        oc.*,
        p.nombre as nombre_proveedor
      FROM ORDEN_COMPRA oc
      JOIN PROVEEDORES p ON oc.Id_Proveedor = p.Id_Proveedor
    `);
    return rows;
  } catch (error) {
    console.error('Error fetching ordenes de compra:', error);
    throw error;
  }
}
