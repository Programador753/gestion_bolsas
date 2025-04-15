import { Pool } from 'pg';

const pool = new Pool({
    user: 'your_database_user',
    host: 'your_database_host',
    database: 'your_database_name',
    password: 'your_database_password',
    port: 5432, // Default PostgreSQL port
});

export const query = async (text, params) => {
    const client = await pool.connect();
    try {
        const res = await client.query(text, params);
        return res;
    } catch (err) {
        console.error('Database query error:', err);
        throw err;
    } finally {
        client.release();
        //erueruerueu
    }
};
// hola vamos a cambiar el puerto
export default pool;