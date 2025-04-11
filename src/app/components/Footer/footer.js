import Image from 'next/image';

export default function Footer() {
  return (
    <footer
      className="bg-gradient-to-r from-[#db001b] to-[#b30017] text-white shadow-lg"
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "10px 20px",
      }}
    >
      <div className="flex items-center space-x-2">
        <Image 
          src="/logoSalesianosWeb.png"
          alt="Logo Salesianos"
          width={50}
          height={50}
          className="rounded-full"
        />
        <div className="text-lg font-bold"> 
          © {new Date().getFullYear()} Salesianos Nuestra Señora del Pilar
        </div>
      </div>
    </footer>
  );
}
