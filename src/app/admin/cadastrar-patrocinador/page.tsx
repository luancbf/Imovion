'use client';

import { useState } from 'react';
import useAuthGuard from '@/hooks/useAuthGuard';
import { Patrocinador } from '@/types/cadastrar-patrocinador';

// Componentes refatorados
import AdminHeader from '@/components/cadastrar-patrocinador/AdminHeader';
import PatrocinadorForm from '@/components/cadastrar-patrocinador/PatrocinadorForm';
import PatrocinadoresList from '@/components/cadastrar-patrocinador/PatrocinadoresList';
import SliderConfiguration from '@/components/cadastrar-patrocinador/SliderConfiguration';
import PatrocinioConfiguration from '@/components/cadastrar-patrocinador/PatrocinioConfiguration';

export default function CadastrarPatrocinador() {
  useAuthGuard();

  // Estados principais da página
  const [showSliderConfig, setShowSliderConfig] = useState(false);
  const [showPatrocinioConfig, setShowPatrocinioConfig] = useState(false);
  const [editingPatrocinador, setEditingPatrocinador] = useState<Patrocinador | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handlers para comunicação entre componentes
  const handleFormSuccess = () => {
    setEditingPatrocinador(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEditPatrocinador = (patrocinador: Patrocinador) => {
    setEditingPatrocinador(patrocinador);
    // Scroll suave para o topo (formulário)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPatrocinador(null);
  };

  const handleToggleSlider = () => {
    setShowSliderConfig(!showSliderConfig);
    // Fechar a outra seção se estiver aberta
    if (showPatrocinioConfig) {
      setShowPatrocinioConfig(false);
    }
  };

  const handleTogglePatrocinio = () => {
    setShowPatrocinioConfig(!showPatrocinioConfig);
    // Fechar a outra seção se estiver aberta
    if (showSliderConfig) {
      setShowSliderConfig(false);
    }
  };

  return (
    <div>
      <AdminHeader
        showSliderConfig={showSliderConfig}
        showPatrocinioConfig={showPatrocinioConfig}
        onToggleSlider={handleToggleSlider}
        onTogglePatrocinio={handleTogglePatrocinio}
      />

      <main className="space-y-8 px-0 sm:px-2">
        
        {/* 1. Formulário de Cadastro/Edição */}
        <PatrocinadorForm
          onSuccess={handleFormSuccess}
          editingPatrocinador={editingPatrocinador}
          onCancelEdit={handleCancelEdit}
        />

        {/* 2. Configuração do Slider (Condicional) */}
        <SliderConfiguration
          isVisible={showSliderConfig}
          onClose={() => setShowSliderConfig(false)}
        />

        {/* 3. Configuração dos Patrocínios (Condicional) */}
        <PatrocinioConfiguration
          isVisible={showPatrocinioConfig}
          onClose={() => setShowPatrocinioConfig(false)}
        />

        {/* 4. Lista de Patrocinadores */}
        <PatrocinadoresList
          onEdit={handleEditPatrocinador}
          refreshTrigger={refreshTrigger}
        />
        
        {/* Indicador de Seções Ativas */}
        {(showSliderConfig || showPatrocinioConfig) && (
          <div className="fixed bottom-24 md:bottom-6 right-6 z-40">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 max-w-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <h4 className="font-semibold text-gray-900 text-sm">
                  🔧 Modo Configuração Ativo
                </h4>
              </div>
              
              <div className="space-y-2 text-xs text-gray-600">
                {showSliderConfig && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Configurando slider da homepage</span>
                  </div>
                )}
                {showPatrocinioConfig && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Configurando seção de patrocínios</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowSliderConfig(false);
                    setShowPatrocinioConfig(false);
                  }}
                  className="w-full text-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕ Fechar todas as configurações
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay Global (se necessário) */}
        {false && ( // Placeholder para loading global
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200 max-w-sm w-full mx-4">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-1">Processando...</h3>
                  <p className="text-sm text-gray-600">Aguarde enquanto salvamos as alterações</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}