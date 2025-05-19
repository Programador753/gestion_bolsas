import { pool } from '@/app/api/lib/db'; 
import { getDepartamentos, getBolsas } from '../functions/select';

export async function GET(request) {
  try {
    console.log('🚀 Iniciando llamada a API Inicio_data...');

    // Obtener departamentos y bolsas con manejo de errores
    let departamentos = [];
    let bolsas = [];
    
    try {
      departamentos = await getDepartamentos();
      console.log('📊 Departamentos obtenidos:', departamentos?.length || 0);
    } catch (err) {
      console.warn('⚠️ Error al obtener departamentos:', err.message);
    }

    try {
      bolsas = await getBolsas();
      console.log('💰 Bolsas obtenidas:', bolsas?.length || 0);
    } catch (err) {
      console.warn('⚠️ Error al obtener bolsas:', err.message);
    }

    // CONSULTA 1: Órdenes de compra - MEJORADA
    console.log('📦 Ejecutando consulta de órdenes...');
    const [ordenesCompra] = await pool.query(`
      SELECT 
          oc.Id AS id,
          oc.Codigo AS codigo,
          COALESCE(d.nombre, 'Sin Departamento') AS departamento,
          COALESCE(p.nombre, 'Sin Proveedor') AS nombre_proveedor,
          COALESCE(oc.Gasto, 0) AS gasto,
          oc.Fecha AS fecha,
          CASE
              WHEN oci.Id_OC_Inversion IS NOT NULL THEN 'Inversión'
              WHEN ocp.Id_OC_Presupuesto IS NOT NULL THEN 'Presupuesto'
              ELSE 'Sin Tipo'
          END AS tipo
      FROM ORDEN_COMPRA oc
      LEFT JOIN DEPARTAMENTO d ON oc.Id_Departamento = d.Id_Departamento
      LEFT JOIN PROVEEDORES p ON oc.Id_Proveedor = p.Id_Proveedor
      LEFT JOIN OC_INVERSION oci ON oc.Id = oci.Id_OrderCompra
      LEFT JOIN OC_PRESUPUESTO ocp ON oc.Id = ocp.Id_OrderCompra
      WHERE YEAR(oc.Fecha) = YEAR(CURDATE())
      ORDER BY oc.Fecha DESC
      LIMIT 50
    `);
    console.log('✅ Órdenes obtenidas:', ordenesCompra?.length || 0);

    // CONSULTA 2: Gastos por departamento
    console.log('💰 Ejecutando consulta de gastos...');
    const [gastoRows] = await pool.query(`
      SELECT 
          d.nombre AS departamento,
          COALESCE(SUM(oc.Gasto), 0) AS gasto_total,
          YEAR(oc.Fecha) AS anio
      FROM DEPARTAMENTO d
      LEFT JOIN ORDEN_COMPRA oc ON d.Id_Departamento = oc.Id_Departamento
      WHERE d.nombre IS NOT NULL
      AND YEAR(oc.Fecha) = YEAR(CURDATE())
      GROUP BY d.Id_Departamento, d.nombre, YEAR(oc.Fecha)
      ORDER BY d.nombre
    `);
    console.log('✅ Gastos obtenidos:', gastoRows?.length || 0);
    console.log('💰 Detalle gastos:', gastoRows);

    // CONSULTA 3: Presupuestos por departamento 
    console.log('📊 Ejecutando consulta de presupuestos...');
    const [presupuestoRows] = await pool.query(`
      SELECT 
          d.nombre AS departamento,
          COALESCE(SUM(b.Inicial), 0) AS presupuesto_total,
          b.Anio AS anio,
          CASE
              WHEN COUNT(bi.Id) > 0 AND COUNT(bp.Id) > 0 THEN 'Mixto'
              WHEN COUNT(bi.Id) > 0 THEN 'Inversión'
              WHEN COUNT(bp.Id) > 0 THEN 'Presupuesto'
              ELSE 'Sin Asignar'
          END AS tipo
      FROM DEPARTAMENTO d
      LEFT JOIN BOLSA b ON d.Id_Departamento = b.Id_Departamento
      LEFT JOIN B_INVERSION bi ON b.Id = bi.Id_Bolsa
      LEFT JOIN B_PRESUPUESTO bp ON b.Id = bp.Id_Bolsa
      WHERE d.nombre IS NOT NULL
      AND b.Anio = YEAR(CURDATE())
      GROUP BY d.Id_Departamento, d.nombre, b.Anio
      ORDER BY d.nombre
    `);
    console.log('✅ Presupuestos obtenidos:', presupuestoRows?.length || 0);
    console.log('📊 Detalle presupuestos:', presupuestoRows);

    // CONSULTA 4: Verificar todos los departamentos
    console.log('🏢 Verificando todos los departamentos...');
    const [allDepartments] = await pool.query(`
      SELECT Id_Departamento, nombre FROM DEPARTAMENTO WHERE nombre IS NOT NULL ORDER BY nombre
    `);
    console.log('🏢 Departamentos en BD:', allDepartments);

    // RESPUESTA MEJORADA
    const response = {
      departamento: departamentos && departamentos.length > 0 ? 
        (departamentos[0].nombre || departamentos[0].Nombre) : '',
      anio: bolsas && bolsas.length > 0 ? bolsas[0].Anio : new Date().getFullYear(),
      presupuesto: presupuestoRows || [],
      ordenes: ordenesCompra || [],
      gasto: gastoRows || [],
      debug: {
        total_departamentos: allDepartments?.length || 0,
        departamentos_con_presupuesto: presupuestoRows?.length || 0,
        departamentos_con_gasto: gastoRows?.length || 0,
        total_ordenes: ordenesCompra?.length || 0
      }
    };

    console.log('✅ Respuesta preparada exitosamente');
    console.log('📊 Resumen completo:', {
      ordenes: response.ordenes.length,
      gastos: response.gasto.length,
      presupuestos: response.presupuesto.length,
      debug: response.debug
    });

    // Log de totales para verificar
    const totalPresupuesto = presupuestoRows.reduce((sum, item) => sum + parseFloat(item.presupuesto_total || 0), 0);
    const totalGasto = gastoRows.reduce((sum, item) => sum + parseFloat(item.gasto_total || 0), 0);
    console.log('💰 TOTALES CALCULADOS:');
    console.log('  - Total Presupuesto:', totalPresupuesto);
    console.log('  - Total Gasto:', totalGasto);
    console.log('  - Saldo Restante:', totalPresupuesto - totalGasto);

    return new Response(JSON.stringify(response), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error("❌ Error detallado en GET /api/Inicio_data:");
    console.error("📝 Mensaje:", error.message);
    console.error("🔍 Stack:", error.stack);
    console.error("🗄️ SQL Error:", error.sql || 'No SQL disponible');

    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error.message,
      code: error.code || 'UNKNOWN',
      timestamp: new Date().toISOString(),
      debug: {
        error_details: process.env.NODE_ENV === 'development' ? error.stack : 'Error en producción'
      }
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}