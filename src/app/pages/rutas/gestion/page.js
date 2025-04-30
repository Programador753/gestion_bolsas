export default function GestionPage() {
  const estado = "Alta"; // Puedes cambiar a "Baja"
  const departamentos = ["Informática", "Calidad", "Logística", "Compras", "Finanzas"];

  return (
    <div className="min-h-screen bg-white flex justify-center items-start pt-10">
      <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-red-500">Nombre Proveedor</h1>

        <p className="mb-4 text-white">
          Estado:{" "}
          <span className={`font-semibold ${estado === "Alta" ? "text-green-400" : "text-red-400"}`}>
            {estado}
          </span>
        </p>

        <h2 className="text-xl font-semibold mb-2 text-white">Departamentos Red</h2>
        <div className="flex flex-col gap-2">
          {departamentos.map((dep, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-white text-black border border-black px-3 py-2 rounded"
            >
              <span>{dep}</span>
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
