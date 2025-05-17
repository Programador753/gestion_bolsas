import { pool } from '@/app/api/lib/db'; 
import { getDepartamentos, getBolsas } from '../functions/select';

export async function GET(request) {
  try {
    // Usa directamente pool.query para evitar fugas de conexiones
    const departamentos = await getDepartamentos();
    const bolsas = await getBolsas();

    const [ordenesCompra] = await pool.query(`
      SELECT 
          oc.Id AS id,
          oc.Codigo AS codigo,
          d.Nombre AS departamento,
          p.Nombre AS nombre_proveedor,
          oc.Gasto AS gasto,
          oc.Fecha AS fecha,
          CASE
              WHEN bi.Id IS NOT NULL THEN 'Inversión'
              WHEN bp.Id IS NOT NULL THEN 'Presupuesto'
              ELSE 'Sin Tipo'
          END AS tipo
      FROM ORDEN_COMPRA oc
      LEFT JOIN USUARIO u ON oc.Id_Usuario = u.Id_Usuario
      LEFT JOIN DEPARTAMENTO d ON oc.Id_Departamento = d.Id_Departamento
      LEFT JOIN PROVEEDORES p ON oc.Id_Proveedor = p.Id_Proveedor
      LEFT JOIN OC_INVERSION oci ON oc.Id = oci.Id_OrderCompra
      LEFT JOIN B_INVERSION bi ON oci.Id_Binversion = bi.Id
      LEFT JOIN OC_PRESUPUESTO ocp ON oc.Id = ocp.Id_OrderCompra
      LEFT JOIN B_PRESUPUESTO bp ON ocp.Id_B_Presupuesto = bp.Id;
    `);

    const [gastoRows] = await pool.query(`
      SELECT SUM(oc.Gasto) AS gasto_total, d.Nombre AS departamento
      FROM ORDEN_COMPRA oc
      JOIN USUARIO u ON oc.Id_Usuario = u.Id_Usuario
      JOIN DEPARTAMENTO d ON oc.Id_Departamento = d.Id_Departamento
      GROUP BY d.Id_Departamento;
    `);

    const [presupuestoRows] = await pool.query(`
      SELECT SUM(b.Inicial) AS presupuesto_total, d.Nombre AS departamento,
          CASE
              WHEN bi.Id IS NOT NULL THEN 'Inversión'
              WHEN bp.Id IS NOT NULL THEN 'Presupuesto'
              ELSE 'Sin Asignar'
          END AS tipo
      FROM BOLSA b
      JOIN DEPARTAMENTO d ON b.Id_Departamento = d.Id_Departamento
      LEFT JOIN B_INVERSION bi ON b.Id = bi.Id_Bolsa
      LEFT JOIN B_PRESUPUESTO bp ON b.Id = bp.Id_Bolsa
      GROUP BY d.Id_Departamento, tipo;
    `);

    const response = {
      departamento: departamentos.length > 0 ? departamentos[0].Nombre : '',
      anio: bolsas.length > 0 ? bolsas[0].Anio : '',
      presupuesto: presupuestoRows,
      ordenes: ordenesCompra,
      gasto: gastoRows,
    };

    return new Response(JSON.stringify(response), { status: 200 });

  } catch (error) {
    console.error("Error en GET /api/Inicio_data:", error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { status: 500 });
  }
}
