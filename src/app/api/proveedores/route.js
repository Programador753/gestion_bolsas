export async function getProveedores() {
  try {
    const [rows] = await pool.query('SELECT * FROM proveedores');
    console.log("Proveedores obtenidos:", rows); // Asegúrate de que se devuelvan datos aquí
    return rows;
  } catch (error) {
    console.error('Error fetching proveedores:', error);
    throw error;
  }
}
