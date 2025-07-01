'use client';

import { useEffect } from 'react';
import { FiSettings, FiX, FiEye, FiImage, FiUpload, FiSave, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { useSliderConfig } from '@/hooks/cadastrar-patrocinador/useSliderConfig';
import { useFileUpload } from '@/hooks/cadastrar-patrocinador/useFileUpload';
import { usePatrocinadores } from '@/hooks/cadastrar-patrocinador/usePatrocinadores';
import Image from "next/image";

interface SliderConfigurationProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function SliderConfiguration({ isVisible, onClose }: SliderConfigurationProps) {
  const { patrocinadores } = usePatrocinadores();
  const { uploadSliderImage } = useFileUpload();
  const {
    sliderBanners,
    loading,
    uploadingImages,
    loadSliderBanners,
    updateSliderBanner,
    setImageUploading,
    saveSliderBanner,
    getSliderImageInfo
  } = useSliderConfig();

  useEffect(() => {
    if (isVisible) {
      loadSliderBanners();
    }
  }, [isVisible, loadSliderBanners]);

  const handleImageUpload = async (imageName: string, file: File) => {
    setImageUploading(imageName, true);
    try {
      const imageUrl = await uploadSliderImage(file, imageName);
      updateSliderBanner(imageName, 'image_url', imageUrl);
      updateSliderBanner(imageName, 'image_alt', `Banner ${getSliderImageInfo(imageName).title}`);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert(error instanceof Error ? error.message : 'Erro ao enviar imagem');
    } finally {
      setImageUploading(imageName, false);
    }
  };

  const handleSaveBanner = async (imageName: string) => {
    try {
      await saveSliderBanner(imageName);
    } catch (error) {
      console.error('Erro ao salvar banner:', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar banner');
    }
  };

  if (!isVisible) return null;

  const activeBanners = sliderBanners.filter(b => b.is_active && b.image_url);
  const totalConfigured = sliderBanners.filter(b => b.image_url).length;

  return (
    <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-blue-100 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <FiSettings className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-blue-900">
              🎠 Configurar Slider da Homepage
            </h2>
            <p className="text-blue-600 text-sm">
              Configure até 3 banners para o carousel principal do site
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={loadSliderBanners}
            disabled={loading}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="Recarregar configurações"
          >
            <div className={`${loading ? 'animate-spin' : ''}`}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10M3.51 15a9 9 0 0 0 14.85 3.36L23 14"/>
              </svg>
            </div>
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Fechar configuração do slider"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* Preview do Slider */}
      <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <FiEye size={20} />
          Preview do Slider
          {activeBanners.length > 0 && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              {activeBanners.length} ativo{activeBanners.length !== 1 ? 's' : ''}
            </span>
          )}
        </h3>
        
        <div className="relative w-full h-40 sm:h-60 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
          <div className="absolute inset-0 flex items-center justify-center">
            {activeBanners.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-2 px-4">
                {activeBanners.map((banner, idx) => (
                  <div key={banner.image_name} className="flex-shrink-0 relative group">
                    <Image
                      src={banner.image_url!}
                      alt={banner.image_alt || ''}
                      width={160}
                      height={90}
                      className="w-32 h-20 sm:w-40 sm:h-24 object-cover rounded-lg border-2 border-white shadow-md transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-semibold">
                      #{idx + 1}
                    </div>
                    <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded-md truncate">
                      {banner.patrocinadores?.nome || 'Sem patrocinador'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <FiImage size={48} className="mx-auto mb-3 opacity-50" />
                <h4 className="font-medium text-gray-600 mb-1">Nenhum banner ativo</h4>
                <p className="text-sm text-gray-500">Configure e ative os banners abaixo para aparecerem no slider</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiImage className="text-blue-600" size={18} />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Slots</p>
              <p className="text-xl font-bold text-blue-900">{sliderBanners.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiToggleRight className="text-green-600" size={18} />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Ativos</p>
              <p className="text-xl font-bold text-green-900">{activeBanners.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FiUpload className="text-orange-600" size={18} />
            </div>
            <div>
              <p className="text-sm text-orange-600 font-medium">Com Imagem</p>
              <p className="text-xl font-bold text-orange-900">{totalConfigured}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiSettings className="text-purple-600" size={18} />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Configurados</p>
              <p className="text-xl font-bold text-purple-900">
                {sliderBanners.filter(b => b.image_url && b.patrocinador_id).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          <span className="ml-3 text-blue-700 font-medium">Carregando configurações do slider...</span>
        </div>
      ) : (
        /* Cards dos Banners */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sliderBanners.map((banner, index) => {
            const imageInfo = getSliderImageInfo(banner.image_name);
            const isUploading = uploadingImages[banner.image_name];
            const hasRequiredData = banner.image_url && banner.patrocinador_id;
            
            return (
              <div 
                key={banner.image_name} 
                className={`relative p-6 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 banner-card ${
                  banner.is_active 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                    : 'bg-gradient-to-br from-blue-50 to-white border-blue-200'
                }`}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  {banner.is_active ? (
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      ATIVO
                    </div>
                  ) : (
                    <div className="bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      INATIVO
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Header */}
                  <div className="pr-20">
                    <h3 className="font-bold text-blue-900 text-lg mb-1">
                      {imageInfo.title}
                    </h3>
                    <p className="text-blue-600 text-sm mb-2">
                      {imageInfo.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-xs text-gray-500">Posição no slider</span>
                    </div>
                  </div>

                  {/* Imagem */}
                  <div className="relative group">
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-blue-100 shadow-md">
                      {banner.image_url ? (
                        <>
                          <Image 
                            src={banner.image_url} 
                            alt={banner.image_alt || imageInfo.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {/* Overlay de hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                          <FiImage size={32} className="text-gray-400 mb-2" />
                          <span className="text-gray-500 text-sm">Sem imagem</span>
                        </div>
                      )}
                      
                      {/* Indicador de posição */}
                      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-blue-900 px-2 py-1 rounded-lg text-xs font-bold">
                        Banner #{index + 1}
                      </div>

                      {/* Indicador de ativo */}
                      {banner.is_active && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                          ● ATIVO
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status do Patrocinador */}
                  {banner.patrocinadores && (
                    <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-green-800 text-sm font-medium">
                          Patrocinador: {banner.patrocinadores.nome}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Upload */}
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(banner.image_name, file);
                        }
                      }}
                      disabled={isUploading}
                      className="hidden"
                      id={`upload-slider-${banner.image_name}`}
                    />
                    <label
                      htmlFor={`upload-slider-${banner.image_name}`}
                      className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
                        isUploading 
                          ? 'border-blue-300 bg-blue-50 text-blue-600 cursor-not-allowed' 
                          : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50 text-blue-700 transform hover:scale-[1.02]'
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                          <span className="text-sm font-medium">Enviando imagem...</span>
                        </>
                      ) : (
                        <>
                          <FiUpload size={16} />
                          <span className="text-sm font-medium">
                            {banner.image_url ? '🔄 Trocar Imagem' : '📁 Escolher Imagem'}
                          </span>
                        </>
                      )}
                    </label>
                    
                    <div className="text-xs text-gray-500 text-center space-y-1">
                      <div>📐 Recomendado: 1920x1080px</div>
                      <div>📦 Máximo: 5MB • Formatos: JPG, PNG, WebP</div>
                    </div>
                  </div>

                  {/* Seleção de Patrocinador */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Patrocinador Vinculado
                    </label>
                    <select
                      value={banner.patrocinador_id}
                      onChange={(e) => updateSliderBanner(banner.image_name, 'patrocinador_id', e.target.value)}
                      className="w-full p-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                    >
                      <option value="">🏢 Selecione o patrocinador</option>
                      {patrocinadores.map(patrocinador => (
                        <option key={patrocinador.id} value={patrocinador.id}>
                          {patrocinador.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Controles */}
                  <div className="space-y-3">
                    {/* Toggle Ativo/Inativo */}
                    <button
                      onClick={() => updateSliderBanner(banner.image_name, 'is_active', !banner.is_active)}
                      disabled={banner.is_active && !hasRequiredData}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] ${
                        banner.is_active 
                          ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      } ${banner.is_active && !hasRequiredData ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`}
                    >
                      {banner.is_active ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                      {banner.is_active ? '✅ Banner Ativo' : '⭕ Ativar Banner'}
                    </button>
                    
                    {/* Botão Salvar */}
                    <button
                      onClick={() => handleSaveBanner(banner.image_name)}
                      disabled={banner.is_active && !hasRequiredData}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100"
                    >
                      <FiSave size={18} />
                      💾 Salvar Configuração
                    </button>
                  </div>

                  {/* Alertas e Validações */}
                  {banner.is_active && !hasRequiredData && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 animate-pulse">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-red-800 text-sm font-semibold">⚠️ Configuração incompleta</p>
                          <p className="text-red-600 text-xs mt-1">
                            {!banner.image_url && !banner.patrocinador_id 
                              ? 'Envie uma imagem e selecione um patrocinador para ativar'
                              : !banner.image_url 
                              ? 'Envie uma imagem para ativar o banner'
                              : 'Selecione um patrocinador para ativar o banner'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasRequiredData && !banner.is_active && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-yellow-800 text-sm font-medium">
                          ✨ Banner pronto para ativar!
                        </p>
                      </div>
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
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
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
        
        .banner-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .banner-card:hover {
          transform: translateY(-4px);
        }
      `}</style>
    </section>
  );
}