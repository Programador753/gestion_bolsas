// Importación de las funciones getProveedores y getDepartamentos desde un archivo que probablemente obtiene datos de una API o base de datos
import { getProveedores, getDepartamentos } from "@/app/api/functions/select";

// Importación del componente CheckDepartamentos, que probablemente es responsable de manejar la visualización y selección de departamentos
import CheckDepartamentos from "./CheckDepartamentos"; // Asegúrate de que la ruta sea correcta

// Definición de un componente asincrónico llamado GestionPage, que acepta un parámetro 'params' (probablemente de la URL)
export default async function GestionPage({ params }) {

  // Decodificación del parámetro 'gestion' de la URL. Esto asegura que los caracteres especiales sean interpretados correctamente
  const nombre = decodeURIComponent(params.gestion);

  // Inicialización de las variables que almacenarán los datos de proveedores y departamentos
  let proveedor;
  let departamentos = [];

  // Bloque try-catch para manejar errores al obtener los datos de la API
  try {
    // Llamadas a las funciones asincrónicas para obtener la lista de proveedores y departamentos
    proveedor = await getProveedores();
    departamentos = await getDepartamentos();
  } catch (error) {
    // Si ocurre un error, se muestra un mensaje de error y el componente no sigue ejecutándose
    console.error("Error al obtener datos:", error.message);
    return (
      <div className="min-h-screen bg-white flex justify-center items-start pt-20 px-4">
        <div className="w-full max-w-md bg-white text-black p-4 rounded-xl shadow-lg border border-black">
          <h1 className="text-3xl font-extrabold mb-6 text-red-600">
            Error al obtener datos
          </h1>
          <p className="text-lg text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  // Se busca el proveedor cuyo nombre coincida con el parámetro 'nombre' (decodificado desde la URL)
  const proveedorSeleccionado = proveedor.find(
    (p) => p.nombre.toLowerCase() === nombre.toLowerCase()
  );

  // Si no se encuentra el proveedor, se muestra un mensaje de error
  if (!proveedorSeleccionado) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center px-4">
        <div className="w-full max-w-md bg-white text-black p-4 rounded-xl shadow-lg border border-black">
          <h1 className="text-3xl font-extrabold mb-6 text-red-600">
            Proveedor no encontrado
          </h1>
          <p className="text-lg text-gray-600">
            No se encontró el proveedor con el nombre: {nombre}
          </p>
        </div>
      </div>
    );
  }

  // Determina el estado del proveedor (si está en "Alta" o "Baja") según el valor de 'estado' en los datos del proveedor
  const estado = proveedorSeleccionado.estado === 0 ? "Baja" : "Alta";

  // La función retorna el JSX que representa la página, mostrando la información del proveedor y los departamentos relacionados
  return (
    <div className="min-h-screen bg-white flex justify-center items-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white text-black p-4 rounded-xl shadow-lg border border-black">
        
        {/* Título con el nombre del proveedor */}
        <h1 className="text-3xl font-extrabold mb-6 text-red-600">
          {proveedorSeleccionado.nombre}
        </h1>

        <div className="mb-6">
          {/* Muestra el estado del proveedor (Alta o Baja) */}
          <p className="text-lg">
            Estado:{" "}
            <span
              className={`font-bold ${estado === "Alta" ? "text-green-600" : "text-red-600"}`}
            >
              {estado}
            </span>
          </p>
        </div>

        {/* Sección de departamentos */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Departamentos en red
          </h2>
          {/* Aquí se pasa la lista de departamentos y el nombre del proveedor al componente CheckDepartamentos */}
          <CheckDepartamentos
            departamentos={departamentos}
            proveedor={proveedorSeleccionado.nombre}
          />
        </div>
      </div>
    </div>
  );
}
