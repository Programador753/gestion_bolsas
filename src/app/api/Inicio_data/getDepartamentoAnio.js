import { pool } from '@/app/api/lib/db';

export async function getDepartamentoAnio() {
    try {
        // Fetch departamento
        const [departamentosResult] = await pool.query('SELECT nombre FROM departamento WHERE Id_Departamento = 1');

        // Fetch año
        const [AnioResult] = await pool.query('SELECT Anio FROM bolsa WHERE Id_Departamento = 1');

        return {
            departamento: departamentosResult[0]?.nombre || 'Desconocido',
            anio: AnioResult[0]?.Anio || 'Desconocido',
        };
    } catch (error) {
        console.error('Error fetching departamento and año:', error);
        throw new Error('Error fetching departamento and año');
    }
}
