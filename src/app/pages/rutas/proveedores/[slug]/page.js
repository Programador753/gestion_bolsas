export default function Page({ params }) { 
    const slug = params.slug || "";
  
    return (
      <div>
        <h1>{slug}</h1>
        <p>Este es el contenido de la página para el slug: {slug}</p>

      </div>
    );
  }