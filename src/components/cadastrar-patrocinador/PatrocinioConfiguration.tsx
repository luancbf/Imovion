'use client';

import { useEffect } from 'react';
import { FiSettings, FiX, FiImage, FiUpload, FiSave, FiToggleLeft, FiToggleRight, FiMousePointer, FiHome, FiRefreshCw } from 'react-icons/fi';
import { usePatrocinioConfig } from '@/hooks/cadastrar-patrocinador/usePatrocinioConfig';
import { useFileUpload } from '@/hooks/cadastrar-patrocinador/useFileUpload';
import { usePatrocinadores } from '@/hooks/cadastrar-patrocinador/usePatrocinadores';
import { PatrocinioConfig } from '@/types/cadastrar-patrocinador';
import Image from "next/image";

interface PatrocinioConfigurationProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function PatrocinioConfiguration({ isVisible, onClose }: PatrocinioConfigurationProps) {
  const { patrocinadores } = usePatrocinadores();
  const { uploadPatrocinioImage } = useFileUpload();
  const {
    patrocinioConfigs,
    loading,
    uploadingPositions,
    loadPatrocinioConfigs,
    updatePatrocinioConfig,
    setPositionUploading,
    savePatrocinioConfig,
    getPatrocinioPositionInfo
  } = usePatrocinioConfig();

  useEffect(() => {
    if (isVisible) {
      loadPatrocinioConfigs();
    }
  }, [isVisible, loadPatrocinioConfigs]);

  const handleImageUpload = async (position: number, file: File) => {
    setPositionUploading(position, true);
    try {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const fileName = `patrocinio-pos-${position + 1}-${timestamp}-${randomId}`;
      
      const imageUrl = await uploadPatrocinioImage(file, fileName);
      updatePatrocinioConfig(position, 'image_url', imageUrl);
      updatePatrocinioConfig(position, 'image_alt', `Patrocínio ${getPatrocinioPositionInfo(position).name}`);
      updatePatrocinioConfig(position, 'image_name', fileName);
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
    } finally {
      setPositionUploading(position, false);
    }
  };

  const handleSaveConfig = async (position: number) => {
    try {
      await savePatrocinioConfig(position);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const canActivate = (config: PatrocinioConfig): boolean => {
    if (!config.image_url) return false;
    if (config.is_clickable === true && !config.patrocinador_id) return false;
    return true;
  };

  const getActivationError = (config: PatrocinioConfig): string | null => {
    if (!config.image_url) return 'Envie uma imagem primeiro';
    if (config.is_clickable === true && !config.patrocinador_id) return 'Selecione um patrocinador para modo clicável';
    return null;
  };

  if (!isVisible) return null;

  return (
    <section className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 border border-blue-100 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-2xl">
            <FiSettings className="text-blue-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-900">
              🎯 Configurar Patrocínios
            </h2>
            <p className="text-blue-600 text-sm">
              Configure as 8 posições de patrocínio do site
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={loadPatrocinioConfigs}
            disabled={loading}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="Recarregar configurações"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Fechar configuração"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          <span className="ml-3 text-blue-700 font-medium">Carregando...</span>
        </div>
      ) : (
        /* Grid das Posições - Otimizado para 4 colunas */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {patrocinioConfigs.map((config) => {
            const positionInfo = getPatrocinioPositionInfo(config.position);
            const isUploading = uploadingPositions[config.position];
            const isClickable = config.is_clickable === true;
            const canActivateConfig = canActivate(config);
            const activationError = getActivationError(config);
            
            return (
              <div 
                key={`${config.position}-${config.image_name || config.id}`}
                className={`relative p-4 rounded-2xl border-2 shadow-md hover:shadow-lg transition-all duration-300 ${
                  config.is_active 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                    : 'bg-gradient-to-br from-blue-50 to-white border-blue-200'
                }`}
              >
                {/* Status Badges */}
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                    config.is_active 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-400 text-white'
                  }`}>
                    {config.is_active ? 'ATIVO' : 'INATIVO'}
                  </div>
                  
                  <div className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    isClickable 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-500 text-white'
                  }`}>
                    {isClickable ? (
                      <>
                        <FiMousePointer size={8} />
                        CLICK
                      </>
                    ) : (
                      <>
                        <FiHome size={8} />
                        HOME
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Header */}
                  <div className="pr-12">
                    <h3 className="font-bold text-blue-900 text-sm mb-1">
                      {positionInfo.name}
                    </h3>
                    <p className="text-blue-600 text-xs mb-2">
                      {positionInfo.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 text-xs font-bold">{config.position + 1}</span>
                      </div>
                      <span className="text-xs text-gray-500">{positionInfo.location}</span>
                    </div>
                  </div>

                  {/* Imagem Quadrada */}
                  <div className="relative group">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-blue-100 shadow-md">
                      {config.image_url ? (
                        <Image 
                          src={config.image_url} 
                          alt={config.image_alt || positionInfo.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                          <FiImage size={20} className="text-gray-400 mb-1" />
                          <span className="text-gray-500 text-xs">Sem imagem</span>
                        </div>
                      )}
                      
                      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-blue-900 px-2 py-1 rounded text-xs font-bold">
                        #{config.position + 1}
                      </div>

                      {config.is_active && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                          ● ATIVO
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload */}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(config.position, file);
                      }}
                      disabled={isUploading}
                      className="hidden"
                      id={`upload-patrocinio-${config.position}`}
                    />
                    <label
                      htmlFor={`upload-patrocinio-${config.position}`}
                      className={`w-full flex items-center justify-center gap-2 p-2 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                        isUploading 
                          ? 'border-blue-300 bg-blue-50 text-blue-600 cursor-not-allowed' 
                          : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50 text-blue-700'
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent" />
                          <span className="text-xs font-medium">Enviando...</span>
                        </>
                      ) : (
                        <>
                          <FiUpload size={12} />
                          <span className="text-xs font-medium">
                            {config.image_url ? 'Trocar' : 'Upload'}
                          </span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Seleção de Patrocinador */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Patrocinador {isClickable && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={config.patrocinador_id || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        updatePatrocinioConfig(config.position, 'patrocinador_id', value === '' ? null : value);
                      }}
                      className="w-full p-2 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all text-xs"
                    >
                      <option value="">
                        {isClickable ? 'Selecionar (obrigatório)' : 'Selecionar (opcional)'}
                      </option>
                      {patrocinadores.map(patrocinador => (
                        <option key={patrocinador.id} value={patrocinador.id}>
                          {patrocinador.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Botão de Clicabilidade */}
                  <button
                    onClick={() => {
                      const newClickable = !isClickable;
                      updatePatrocinioConfig(config.position, 'is_clickable', newClickable);
                      if (!newClickable) {
                        updatePatrocinioConfig(config.position, 'patrocinador_id', null);
                      }
                    }}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-medium transition-all text-xs ${
                      isClickable 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'bg-gray-400 hover:bg-gray-500 text-white'
                    }`}
                  >
                    {isClickable ? <FiMousePointer size={12} /> : <FiHome size={12} />}
                    <span>{isClickable ? 'Clicável' : 'Não Clicável'}</span>
                  </button>

                  {/* Controles */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Toggle Ativo/Inativo */}
                    <button
                      onClick={() => updatePatrocinioConfig(config.position, 'is_active', !config.is_active)}
                      disabled={!canActivateConfig}
                      className={`flex items-center justify-center gap-1 px-2 py-2 rounded-xl font-medium text-xs transition-all ${
                        config.is_active 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : canActivateConfig
                          ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      title={activationError || undefined}
                    >
                      {config.is_active ? <FiToggleRight size={12} /> : <FiToggleLeft size={12} />}
                      {config.is_active ? 'Ativo' : 'Ativar'}
                    </button>
                    
                    {/* Botão Salvar */}
                    <button
                      onClick={() => handleSaveConfig(config.position)}
                      className="flex items-center justify-center gap-1 px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-xs transition-all"
                    >
                      <FiSave size={12} />
                      Salvar
                    </button>
                  </div>

                  {/* Erro de ativação */}
                  {!canActivateConfig && activationError && (
                    <div className="text-xs text-red-600 text-center p-2 bg-red-50 rounded-lg border border-red-200">
                      ❌ {activationError}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CSS para animações */}
      <style jsx>{`
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}