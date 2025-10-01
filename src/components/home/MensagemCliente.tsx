'use client';

import { FiMessageCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function MensagemCliente() {
  const numeroWhatsApp = "65999772500";
  const mensagem = encodeURIComponent(
    "Olá! Não encontrei o imóvel que procuro no site. Vocês podem me ajudar a encontrar o imóvel ideal?"
  );

  const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;

  const handleWhatsAppClick = () => {
    window.open(linkWhatsApp, '_blank');
  };

  return (
    <section className="w-full pt-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Layout Horizontal - Desktop e Tablet */}
        <div className="hidden md:flex items-center justify-between bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
          
          {/* Lado Esquerdo - Conteúdo */}
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                <FiMessageCircle className="text-white" size={24} />
              </div>
            </div>
            
            <div className="text-left">
              <h3 className="font-poppins text-xl lg:text-2xl font-bold text-gray-800 mb-1">
                Não encontrou o imóvel dos seus 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"> sonhos</span>?
              </h3>
              <p className="font-inter text-sm lg:text-base text-gray-600 leading-relaxed">
                Mande uma mensagem e <strong className="text-blue-700">iremos buscar o imóvel perfeito</strong> para você! ✨
              </p>
            </div>
          </div>

          {/* Lado Direito - Botão */}
          <div className="flex-shrink-0 ml-6">
            <button
              onClick={handleWhatsAppClick}
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 lg:py-4 lg:px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm lg:text-base whitespace-nowrap cursor-pointer"
            >
              <FaWhatsapp 
                className="group-hover:scale-110 transition-transform duration-300" 
                size={20} 
              />
              <span>Fale Conosco</span>
            </button>
          </div>
        </div>

        {/* Layout Compacto - Mobile */}
        <div className="md:hidden bg-white rounded-2xl shadow-lg border border-gray-100 px-3 py-3 flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-md">
              <FiMessageCircle className="text-white" size={18} />
            </div>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h3 className="font-poppins text-sm font-bold text-gray-800 leading-tight">
              Não encontrou o imóvel dos seus
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"> sonhos</span>?
            </h3>
            <p className="font-inter text-sm text-gray-600 leading-snug">
              <span className="text-blue-700 font-semibold">Fale conosco!</span>
            </p>
          </div>
          <button
            onClick={handleWhatsAppClick}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-7 rounded-md shadow-md text-sm whitespace-nowrap"
            style={{ minHeight: 32 }}
          >
            <FaWhatsapp size={15} />
            <span>WhatsApp</span>
          </button>
        </div>

      </div>
    </section>
  );
}