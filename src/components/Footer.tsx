import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-400 p-10 mt-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Logo / Nome */}
        <div className="flex flex-col items-center md:items-start">
          <div className="text-2xl font-bold mb-2">LOGO</div>
          <p className="text-sm text-gray-700">© {new Date().getFullYear()} Todos os direitos reservados.</p>
        </div>

        {/* Links rápidos */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-lg font-semibold mb-2">Navegação</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/comprar">Comprar</Link></li>
            <li><Link href="/alugar">Alugar</Link></li>
            <li><Link href="/rural">Rural</Link></li>
          </ul>
        </div>

        {/* Contato */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-lg font-semibold mb-2">Contato</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>Telefone: (99) 99999-9999</li>
            <li>Email: contato@seusite.com</li>
            <li>
              <a href="https://wa.me/5599999999999" target="_blank" className="hover:underline">
                Fale no WhatsApp
              </a>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
