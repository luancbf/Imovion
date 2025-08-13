'use client';

import { FiMessageCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function MensagemCliente() {
  const numeroWhatsApp = "5511999999999"; // Substitua pelo número real
  const mensagem = encodeURIComponent(
    "Olá! Não encontrei o imóvel que procuro no site. Vocês podem me ajudar a encontrar o imóvel ideal?"
  );

  const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;

  const handleWhatsAppClick = () => {
    window.open(linkWhatsApp, '_blank');
  };

  return (
    <section className="w-full pt-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Layout Horizontal - Desktop e Tablet */}
        <div className="hidden md:flex items-center justify-between bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
          
          {/* Lado Esquerdo - Conteúdo */}
          <div className="flex items-center gap-6 flex-1">
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

        {/* Layout Vertical - Mobile */}
        <div className="md:hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-5 text-center">
          
          <div className="mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-md mx-auto mb-3">
              <FiMessageCircle className="text-white" size={20} />
            </div>
            
            <h3 className="font-poppins text-lg font-bold text-gray-800 mb-2 leading-tight">
              Não encontrou o imóvel dos seus 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"> sonhos</span>?
            </h3>
            
            <p className="font-inter text-sm text-gray-600 leading-relaxed">
              Mande uma mensagem e <strong className="text-blue-700">iremos buscar o imóvel perfeito</strong> para você! ✨
            </p>
          </div>

          <button
            onClick={handleWhatsAppClick}
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm"
          >
            <FaWhatsapp 
              className="group-hover:scale-110 transition-transform duration-300" 
              size={18} 
            />
            <span>Fale Conosco</span>
          </button>
        </div>

      </div>
    </section>
  );
}