import { getProveedores, getDepartamentos } from "@/app/api/functions/select";
import { getDepartamentosDeProveedor } from "@/app/api/functions/select"; // Asegúrate de importar la nueva función

export default async function GestionPage({ params }) {
  const nombre = decodeURIComponent(params.gestion);

  let proveedor;
  let departamentos = [];
  let departamentosRelacionados = [];

  try {
    proveedor = await getProveedores();
    departamentos = await getDepartamentos();
  } catch (error) {
    console.error("Error al obtener proveedores o departamentos:", error.message);
  }

  const proveedorSeleccionado = proveedor.find(
    (p) => p.nombre.toLowerCase() === nombre.toLowerCase()
  );


  try {
    departamentosRelacionados = await getDepartamentosDeProveedor(proveedorSeleccionado.Id_Proveedor);
  } catch (error) {
    console.error("Error al obtener departamentos relacionados:", error.message);
  }

  return (
    <div className="min-h-screen bg-white flex justify-center items-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white text-black p-4 rounded-xl shadow-lg border border-black">
        <h1 className="text-3xl font-extrabold mb-6 text-red-600">
          {proveedorSeleccionado.nombre}
        </h1>

        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Departamentos en red
          </h2>
          <div className="space-y-3">
            {departamentos.map((dep) => (
              <div
                key={dep.id}
                className="flex justify-between items-center bg-white border border-black px-4 py-3 rounded-lg hover:bg-gray-100 transition"
              >
                <span className="font-medium">{dep.nombre}</span>
                <input
                  type="checkbox"
                  className="h-5 w-5 text-red-600 accent-red-600 cursor-pointer"
                  defaultChecked={departamentosRelacionados.includes(dep.Id_Departamento)}
                  //Marca el checkbox del departamento que está relacionado
                />

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
