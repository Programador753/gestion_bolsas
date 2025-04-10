import Image from 'next/image';

export default function Header() {
  return (
    <header style={{ backgroundColor: '#d71920', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
      {/* Logo y título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Image src="/logoSalesianosWeb.png" alt="Logo Salesianos" width={50} height={50} />
        <div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Gestión</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Salesianos</div>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '30px', fontSize: '18px' }}>
        <a href="./" style={{ color: 'white', textDecoration: 'none' }}>Inicio</a>
        <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Órdenes de Compra</a>
        <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Bolsas</a>

        {/* Tooltip personalizado para Departamentos */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Departamentos</a>
          
        </div>

        <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Proveedores</a>
      </nav>

      {/* Imagen de perfil */}
      <div>
        <Image src="/sdb-logo-big.png" alt="Usuario" width={60} height={60} style={{ borderRadius: '50%' }} />
      </div>
    </header>
  );
}
