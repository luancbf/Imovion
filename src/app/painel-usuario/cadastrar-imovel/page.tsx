"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FiArrowLeft, FiHome } from "react-icons/fi";
import { opcoesTipoImovel } from "@/constants/opcoesTipoImovel";

// Importação dinâmica do formulário para melhor performance
const FormularioImovel = dynamic(() => import("@/components/cadastrar-imovel/FormularioImovel"), {
  loading: () => (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  )
});

export default function CadastrarImovelPage() {
  const router = useRouter();
  const [imovelCadastrado, setImovelCadastrado] = useState(false);

  const handleImovelCadastrado = () => {
    setImovelCadastrado(true);
    
    // Redirecionar para meus imóveis após 3 segundos
    setTimeout(() => {
      router.push("/painel-usuario/meus-imoveis");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <FiArrowLeft size={24} className="text-blue-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <FiHome className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Cadastrar Novo Imóvel</h1>
              <p className="text-sm md:text-base text-gray-600">Preencha as informações do seu imóvel para anunciá-lo</p>
            </div>
          </div>
        </div>

        {/* Sucesso */}
        {imovelCadastrado ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">✓</span>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-green-800 mb-4">
              Imóvel Cadastrado com Sucesso! 🎉
            </h2>
            
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Seu imóvel foi cadastrado e já está disponível para visualização. 
              Você será redirecionado para seus imóveis em alguns segundos.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/painel-usuario/meus-imoveis")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ver Meus Imóveis
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cadastrar Outro
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Formulário */}
            <FormularioImovel
              opcoesTipoImovel={opcoesTipoImovel}
              onSuccess={handleImovelCadastrado}
            />

            {/* Informações Importantes */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 md:p-6 mt-6 md:mt-8">
              <h3 className="text-base md:text-lg font-semibold text-blue-900 mb-3">📋 Informações Importantes</h3>
              <ul className="space-y-2 text-sm md:text-base text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Preencha todos os campos obrigatórios para que seu anúncio seja publicado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Adicione fotos de qualidade para atrair mais interessados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Seja detalhado na descrição para esclarecer dúvidas dos interessados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Após o cadastro, você poderá editar apenas a descrição e o valor</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}