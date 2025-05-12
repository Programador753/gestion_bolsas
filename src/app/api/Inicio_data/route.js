import { pool } from '@/app/api/lib/db';
import { getDepartamentoAnio } from './getDepartamentoAnio';

export async function GET(request) {
    try {
        console.log("Iniciando solicitud GET en /api/Inicio_data");

        const { departamento, anio } = await getDepartamentoAnio();
        console.log("Datos obtenidos de getDepartamentoAnio:", { departamento, anio });

        // Fetch últimas órdenes de compra
        const [ordenesResult] = await pool.query('SELECT fecha, tipo, gasto FROM orden_compra ORDER BY fecha DESC LIMIT 3');
        console.log("Últimas órdenes de compra:", ordenesResult);

        // Fetch presupuesto total
        const [presupuestoResult] = await pool.query(`
        SELECT
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
        WHERE b.Anio = ${anio} AND d.Id_Departamento = 1
        ORDER BY b.Anio DESC;
        `);
        console.log("Presupuesto total:", presupuestoResult);

        // Fetch gasto total - NO TERMINADO
        const [gastoResult] = await pool.query('SELECT COALESCE(SUM(gasto), 0) AS gasto_total FROM orden_compra');
        console.log("Gasto total:", gastoResult);

        console.log("Datos enviados a la respuesta:", {
            departamento,
            anio,
            ordenes: ordenesResult,
            presupuesto: presupuestoResult,
            gasto: gastoResult[0].gasto_total,
        });

        return new Response(
            JSON.stringify({
                departamento,
                anio,
                ordenes: ordenesResult,
                presupuesto: presupuestoResult,
                gasto: gastoResult[0].gasto_total,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching data:', error);
        return new Response(
            JSON.stringify({ error: 'Error fetching data' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}