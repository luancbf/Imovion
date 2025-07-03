'use client';

import { useEffect } from 'react';
import { FiSettings, FiX, FiImage, FiUpload, FiSave, FiToggleLeft, FiToggleRight, FiMousePointer, FiHome } from 'react-icons/fi';
import { useSliderConfig } from '@/hooks/cadastrar-patrocinador/useSliderConfig';
import { useFileUpload } from '@/hooks/cadastrar-patrocinador/useFileUpload';
import { usePatrocinadores } from '@/hooks/cadastrar-patrocinador/usePatrocinadores';
import { SliderBanner } from '@/types/cadastrar-patrocinador';
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
    } finally {
      setImageUploading(imageName, false);
    }
  };

  const handleSaveBanner = async (imageName: string) => {
    try {
      await saveSliderBanner(imageName);
    } catch (error) {
      console.error('Erro ao salvar banner:', error);
    }
  };

  // ✅ Lógica de validação simplificada
  const canActivate = (banner: SliderBanner): boolean => {
    if (!banner.image_url) return false;
    if (banner.is_clickable === true && !banner.patrocinador_id) return false;
    return true;
  };

  const getActivationError = (banner: SliderBanner): string | null => {
    if (!banner.image_url) return 'Envie uma imagem primeiro';
    if (banner.is_clickable === true && !banner.patrocinador_id) return 'Selecione um patrocinador para modo clicável';
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
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10M3.51 15a9 9 0 0 0 14.85 3.36L23 14"/>
              </svg>
            </div>
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Fechar configuração do slider"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          <span className="ml-3 text-blue-700 font-medium">Carregando configurações...</span>
        </div>
      ) : (
        /* Cards dos Banners */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {sliderBanners.map((banner, index) => {
            const imageInfo = getSliderImageInfo(banner.image_name);
            const isUploading = uploadingImages[banner.image_name];
            const isClickable = banner.is_clickable === true;
            const canActivateBanner = canActivate(banner);
            const activationError = getActivationError(banner);
            
            return (
              <div 
                key={banner.image_name} 
                className={`relative p-4 rounded-2xl border-2 shadow-md hover:shadow-lg transition-all duration-300 banner-card ${
                  banner.is_active 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                    : 'bg-gradient-to-br from-blue-50 to-white border-blue-200'
                }`}
              >
                {/* Status Badges */}
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                    banner.is_active 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-400 text-white'
                  }`}>
                    {banner.is_active ? 'ATIVO' : 'INATIVO'}
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
                      {imageInfo.title}
                    </h3>
                    <p className="text-blue-600 text-xs mb-2">
                      {imageInfo.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-xs text-gray-500">Posição no slider</span>
                    </div>
                  </div>

                  {/* Imagem */}
                  <div className="relative group">
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-blue-100 shadow-md">
                      {banner.image_url ? (
                        <>
                          <Image 
                            src={banner.image_url} 
                            alt={banner.image_alt || imageInfo.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className={`absolute inset-0 transition-colors duration-200 ${
                            isClickable
                              ? 'bg-black/0 group-hover:bg-blue-500/20' 
                              : 'bg-black/0 group-hover:bg-gray-500/20'
                          }`} />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                          <FiImage size={20} className="text-gray-400 mb-1" />
                          <span className="text-gray-500 text-xs">Sem imagem</span>
                        </div>
                      )}
                      
                      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-blue-900 px-2 py-1 rounded text-xs font-bold">
                        Banner #{index + 1}
                      </div>

                      {banner.is_active && (
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
                            {banner.image_url ? 'Trocar' : 'Upload'}
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
                      value={banner.patrocinador_id || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateSliderBanner(banner.image_name, 'patrocinador_id', value === '' ? null : value);
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

                  {/* Botão de Comportamento de Clique */}
                  <button
                    onClick={() => {
                      const newClickable = !isClickable;
                      updateSliderBanner(banner.image_name, 'is_clickable', newClickable);
                      if (!newClickable) {
                        updateSliderBanner(banner.image_name, 'patrocinador_id', null);
                      }
                    }}
                    className={`w-full flex items-center justify-center gap-1 px-2 py-2 rounded-xl font-medium transition-all text-xs ${
                      isClickable 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'bg-gray-400 hover:bg-gray-500 text-white'
                    }`}
                  >
                    {isClickable ? <FiMousePointer size={12} /> : <FiHome size={12} />}
                    <span>
                      {isClickable ? 'Clicável' : 'Não Clicável'}
                    </span>
                  </button>

                  {/* Controles */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Toggle Ativo/Inativo */}
                    <button
                      onClick={() => updateSliderBanner(banner.image_name, 'is_active', !banner.is_active)}
                      disabled={!canActivateBanner}
                      className={`flex items-center justify-center gap-1 px-2 py-2 rounded-xl font-medium text-xs transition-all ${
                        banner.is_active 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : canActivateBanner
                          ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      title={activationError || undefined}
                    >
                      {banner.is_active ? <FiToggleRight size={12} /> : <FiToggleLeft size={12} />}
                      {banner.is_active ? 'Ativo' : 'Ativar'}
                    </button>
                    
                    {/* Botão Salvar */}
                    <button
                      onClick={() => handleSaveBanner(banner.image_name)}
                      className="flex items-center justify-center gap-1 px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-xs transition-all"
                    >
                      <FiSave size={12} />
                      Salvar
                    </button>
                  </div>

                  {/* Erro de ativação */}
                  {!canActivateBanner && activationError && (
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