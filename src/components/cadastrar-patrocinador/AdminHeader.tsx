'use client';

import { FiEye, FiEyeOff, FiSettings, FiUpload } from 'react-icons/fi';

interface AdminHeaderProps {
  showSliderConfig: boolean;
  showPatrocinioConfig: boolean;
  onToggleSlider: () => void;
  onTogglePatrocinio: () => void;
}

export default function AdminHeader({
  showSliderConfig,
  showPatrocinioConfig,
  onToggleSlider,
  onTogglePatrocinio
}: AdminHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-blue-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Título */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <FiSettings className="text-blue-600" size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-blue-900">
                  Gerenciar Patrocinadores
                </h1>
                <p className="text-xs text-blue-600 hidden sm:block">
                  Promover usuários e configurar exibição
                </p>
              </div>
            </div>
          </div>

          {/* Navegação Central */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onToggleSlider}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                showSliderConfig 
                  ? 'bg-blue-600 text-white shadow-lg scale-105' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:scale-105'
              }`}
              title={showSliderConfig ? 'Ocultar configuração do slider' : 'Mostrar configuração do slider'}
            >
              {showSliderConfig ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              <span className="hidden lg:inline">Slider</span>
              {showSliderConfig && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </button>

            <button
              onClick={onTogglePatrocinio}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                showPatrocinioConfig 
                  ? 'bg-green-600 text-white shadow-lg scale-105' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200 hover:scale-105'
              }`}
              title={showPatrocinioConfig ? 'Ocultar configuração dos patrocínios' : 'Mostrar configuração dos patrocínios'}
            >
              {showPatrocinioConfig ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              <span className="hidden lg:inline">Patrocínios</span>
              {showPatrocinioConfig && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </button>
          </div>

          {/* Menu Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleSlider}
              className={`p-2 rounded-lg transition-colors ${
                showSliderConfig 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-700'
              }`}
              title="Toggle Slider Config"
            >
              <FiSettings size={18} />
            </button>
            <button
              onClick={onTogglePatrocinio}
              className={`p-2 rounded-lg transition-colors ${
                showPatrocinioConfig 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-100 text-green-700'
              }`}
              title="Toggle Patrocínio Config"
            >
              <FiUpload size={18} />
            </button>
          </div>
        </div>

        {/* Barra de Status (quando alguma seção está ativa) */}
        {(showSliderConfig || showPatrocinioConfig) && (
          <div className="border-t border-blue-100 bg-blue-50/50 px-4 py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                {showSliderConfig && (
                  <div className="flex items-center gap-2 text-blue-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="font-medium">Configuração do Slider Ativa</span>
                  </div>
                )}
                {showPatrocinioConfig && (
                  <div className="flex items-center gap-2 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-medium">Configuração dos Patrocínios Ativa</span>
                  </div>
                )}
              </div>
              
              <div className="text-gray-500">
                Use os botões acima para alternar entre as seções
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}