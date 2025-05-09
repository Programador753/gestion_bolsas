// Esta es la directiva que indica que el componente debe ser tratado como un componente de cliente (es decir, se ejecutará en el cliente y no en el servidor)
// Esto es necesario para usar hooks como `useState` y `useEffect`, que solo pueden ser utilizados en componentes de cliente.
"use client"; 

// Importación de los hooks `useState` y `useEffect` de React. 
// `useState` se utiliza para manejar el estado local en el componente y `useEffect` se utiliza para ejecutar efectos secundarios (como actualizar el localStorage).
import { useState, useEffect } from "react";

// Definición del componente `CheckDepartamentos`, que recibe dos props: `departamentos` (una lista de departamentos) y `proveedor` (nombre del proveedor)
export default function CheckDepartamentos({ departamentos, proveedor }) {

  // Se crea una clave para almacenar los datos en el localStorage que está asociada al proveedor (se usa el nombre del proveedor en minúsculas)
  const STORAGE_KEY = `checkboxes_departamentos_${proveedor.toLowerCase()}`;

  // Función para inicializar el estado de los checkboxes. Primero, intenta obtener el estado guardado en el localStorage. 
  // Si no existe, crea un estado inicial con todos los departamentos desmarcados.
  const initialState = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored); // Si ya existen datos en el localStorage, los usa.
    
    // Si no hay datos guardados, crea un objeto con el nombre de cada departamento y su estado inicial (false, es decir, no marcado)
    return departamentos.reduce((acc, dep) => {
      acc[dep.nombre] = false;  // Establece el estado de cada checkbox en `false`
      return acc;
    }, {});
  };

  // `useState` inicializa el estado `checkedItems`, que almacenará los estados de los checkboxes.
  // También inicializa `mensaje`, que se usará para mostrar un mensaje cuando se guarden los cambios.
  const [checkedItems, setCheckedItems] = useState(initialState);
  const [mensaje, setMensaje] = useState("");

  // `useEffect` es un hook que se ejecuta cada vez que cambia el estado de `checkedItems`. 
  // Cada vez que se cambian los estados de los checkboxes, los nuevos valores se guardan en el localStorage.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedItems));
  }, [checkedItems]); // El efecto se ejecuta cuando `checkedItems` cambia.

  // Función que maneja el cambio de estado de un checkbox (marcar/desmarcar)
  const handleCheckboxChange = (nombre) => {
    // Cambia el estado del checkbox correspondiente (si estaba marcado, se desmarca y viceversa)
    setCheckedItems((prev) => ({
      ...prev,  // Mantiene los valores anteriores
      [nombre]: !prev[nombre],  // Cambia el valor del checkbox especificado
    }));
  };

  // Función que maneja el clic en el botón "Guardar cambios"
  const handleGuardar = () => {
    setMensaje("Cambios guardados");  // Muestra el mensaje de que los cambios se guardaron
    // El mensaje de confirmación se oculta después de 3 segundos
    setTimeout(() => setMensaje(""), 3000);
  };

  // JSX que describe cómo se debe renderizar el componente
  return (
    <div className="space-y-3">
      {/* Muestra una lista de checkboxes para cada departamento */}
      {departamentos.map((dep) => (
        <div
          key={dep.nombre}  // Usamos el nombre del departamento como clave única
          className="flex justify-between items-center bg-white border border-black px-4 py-3 rounded-lg hover:bg-gray-100 transition"
        >
          <span className="font-medium">{dep.nombre}</span>  {/* Muestra el nombre del departamento */}
          <input
            type="checkbox"
            className="h-5 w-5 text-red-600 accent-red-600 cursor-pointer"
            checked={checkedItems[dep.nombre]}  // El checkbox está marcado si el valor de `checkedItems[dep.nombre]` es `true`
            onChange={() => handleCheckboxChange(dep.nombre)}  // Al cambiar, se llama a `handleCheckboxChange`
          />
        </div>
      ))}

      {/* Botón para guardar los cambios */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleGuardar}  // Llama a `handleGuardar` cuando se hace clic
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
        >
          Guardar cambios
        </button>
      </div>

      {/* Muestra el mensaje de confirmación si hay alguno */}
      {mensaje && (
        <p className="text-green-600 font-semibold text-center mt-2">
          {mensaje}  {/* Muestra el mensaje ("Cambios guardados") */}
        </p>
      )}
    </div>
  );
}
