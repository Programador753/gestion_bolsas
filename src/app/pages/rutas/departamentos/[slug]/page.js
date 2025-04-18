// Es una ruta dinamica en next.js que captura el slug de la URL y lo muestra en la página 
export default function Page({ params }) { 
    const slug = params.slug || "";
  
    return (
      <div>
        <h1>{slug}</h1>
        <p>Este es el contenido de la página para el slug: {slug}</p>

      </div>
    );
  }
  