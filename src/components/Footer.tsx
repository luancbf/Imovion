export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-blue-100 to-blue-200 p-10 mt-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo / Nome */}
        <div className="flex flex-col items-center md:items-start">
          <div className="text-2xl font-bold mb-2 text-blue-800">LOGO</div>
          <p className="text-sm text-blue-700">
            © {new Date().getFullYear()} Todos os direitos reservados.
          </p>
        </div>

        {/* Contato */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-lg font-semibold mb-2 text-blue-900">Contato</h3>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>Telefone: (99) 99999-9999</li>
            <li>
              Email:{" "}
              <a href="mailto:contato@seusite.com" className="hover:underline">
                contato@seusite.com
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/5599999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                aria-label="Fale conosco no WhatsApp"
              >
                Fale no WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}