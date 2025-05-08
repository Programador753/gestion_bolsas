import { pool } from '../lib/db';

export async function GET(request) {
    try {
        // Fetch últimas órdenes de compra
        const [ordenesResult] = await pool.query('SELECT descripcion, monto FROM ordenes_compra ORDER BY fecha DESC LIMIT 3');

        // Fetch presupuesto total
        const [presupuestoResult] = await pool.query('SELECT presupuesto_total FROM departamento WHERE id = 1');

        // Fetch gasto total
        const [gastoResult] = await pool.query('SELECT SUM(monto) AS gasto_total FROM ordenes_compra');

        return new Response(
            JSON.stringify({
                ordenes: ordenesResult,
                presupuesto: presupuestoResult[0]?.presupuesto_total || 0,
                gasto: gastoResult[0]?.gasto_total || 0,
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