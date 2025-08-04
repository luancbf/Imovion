import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-blue-100 to-blue-200 pt-10 pb-10 border-t border-blue-200">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-4 gap-8">
        {/* Contato - Esquerda */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left md:ml-20">
          <h3 className="font-poppins text-lg font-semibold mb-2 text-blue-900">CONTATO</h3>
          <ul className="font-inter space-y-1 text-sm text-blue-700">
            <li>
              <span className="text-blue-900 font-semibold">Email:</span>{" "}
              <a href="mailto:imovionmt@gmail.com" className="hover:underline">
                imovionmt@gmail.com
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/5599999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1 justify-center md:justify-start"
                aria-label="Fale conosco no WhatsApp"
              >
                <svg width={18} height={18} fill="currentColor" className="inline text-green-600" viewBox="0 0 24 24"><path d="M20.52 3.48A12.07 12.07 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.22-1.62A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.21-1.25-6.23-3.48-8.52zM12 22c-1.77 0-3.5-.46-5.01-1.33l-.36-.21-3.69.96.99-3.59-.23-.37A9.93 9.93 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.8c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.19-.44-2.26-1.41-.84-.75-1.41-1.68-1.58-1.96-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.48.14-.16.18-.28.28-.46.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.27-.97.95-.97 2.3 0 1.35.99 2.65 1.13 2.83.14.18 1.95 2.98 4.74 4.06.66.28 1.18.45 1.58.58.66.21 1.26.18 1.73.11.53-.08 1.65-.67 1.89-1.32.23-.65.23-1.21.16-1.32-.07-.11-.25-.18-.53-.32z"/></svg>
                Fale no WhatsApp
              </a>
            </li>
          </ul>
        </div>

        {/* Logo / Nome - Direita */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right md:mr-20">
          <Image
            src="/imovion.png"
            alt="Imovion Logo"
            width={320}
            height={80}
            className="h-12 w-auto mb-2"
            priority
          />
          <p className="font-inter text-sm text-blue-700">
            © {new Date().getFullYear()} Todos os direitos reservados.
          </p>
          <p className="font-inter text-xs text-blue-600 mt-1">
            Desenvolvido por{" "}
            <a
              href="https://www.capistranodev.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-900 font-semibold"
            >
              CapistranoDev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}