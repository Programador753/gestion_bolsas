import { pool } from '@/app/api/lib/db';
import { getDepartamentos, getBolsas, getOrdenCompra, getLastOrdenCompra } from '../functions/select';

export async function GET(request) {
    try {
        console.log('Fetching departamentos...');
        const departamentos = await getDepartamentos();
        console.log('Departamentos:', departamentos);

        console.log('Fetching bolsas...');
        const bolsas = await getBolsas();
        console.log('Bolsas:', bolsas);

        console.log('Fetching ordenesCompra...');
        const ordenesCompra = await pool.query(`
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
            LEFT JOIN DEPARTAMENTO d ON u.Id_Departamento = d.Id_Departamento
            LEFT JOIN PROVEEDORES p ON oc.Id_Proveedor = p.Id_Proveedor
            LEFT JOIN OC_INVERSION oci ON oc.Id = oci.Id_OrderCompra
            LEFT JOIN B_INVERSION bi ON oci.Id_Binversion = bi.Id
            LEFT JOIN OC_PRESUPUESTO ocp ON oc.Id = ocp.Id_OrderCompra
            LEFT JOIN B_PRESUPUESTO bp ON ocp.Id_B_Presupuesto = bp.Id;
        `);
        console.log('OrdenesCompra:', ordenesCompra[0]);

        console.log('Fetching gastoPorDepartamento...');
        const [gastoRows] = await pool.query(`
            SELECT SUM(ORDEN_COMPRA.Gasto) AS gasto_total, DEPARTAMENTO.Nombre AS departamento
            FROM ORDEN_COMPRA
            JOIN USUARIO ON ORDEN_COMPRA.Id_Usuario = USUARIO.Id_Usuario
            JOIN DEPARTAMENTO ON USUARIO.Id_Departamento = DEPARTAMENTO.Id_Departamento
            GROUP BY DEPARTAMENTO.Id_Departamento;
        `);
        console.log('GastoPorDepartamento:', gastoRows);

        console.log('Fetching presupuestoPorDepartamento...');
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
        console.log('PresupuestoPorDepartamento:', presupuestoRows);

        const response = {
            departamento: departamentos.length > 0 ? departamentos[0].nombre : '',
            anio: bolsas.length > 0 ? bolsas[0].Anio : '',
            presupuesto: presupuestoRows,
            ordenes: ordenesCompra[0],
            gasto: gastoRows,
        };

        return new Response(JSON.stringify(response), { status: 200 });
        
    } catch (error) {
        console.error('Error in API route:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { status: 500 });
    }
}