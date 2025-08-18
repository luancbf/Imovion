'use client';

import React, { useEffect, useState } from 'react';
import { FiSettings, FiX, FiImage, FiUpload, FiMousePointer, FiHome, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { useSliderConfig } from '@/hooks/cadastrar-patrocinador/useSliderConfig';
import { usePatrocinadores } from '@/hooks/cadastrar-patrocinador/usePatrocinadores';
import { SliderBanner } from '@/types/cadastrar-patrocinador';
import Image from "next/image";
import ConfirmModal from '@/components/common/ConfirmModal';
import AlertModal from '@/components/common/AlertModal';

interface SliderConfigurationProps {
  isVisible: boolean;
  onClose: () => void;
}

type SliderBannerUpdateValue = string | boolean | number | null;

interface BannerCardProps {
  banner: SliderBanner;
  index: number;
  onImageUpload: (imageName: string, file: File) => void;
  onDelete: (imageName: string) => void;
  onUpdate: (imageName: string, field: keyof SliderBanner, value: SliderBannerUpdateValue) => void;
  patrocinadores: Array<{ id: string; nome: string }>;
  isUploading: boolean;
  saveSliderBanner: (imageName: string) => Promise<void>;
  loading: boolean;
}

function BannerCard({
  banner,
  index,
  onImageUpload,
  onDelete,
  onUpdate,
  patrocinadores,
  isUploading,
  saveSliderBanner,
  loading
}: BannerCardProps) {
  const isClickable = banner.is_clickable === true;
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ open: boolean; type: "success" | "error"; message: string }>({ open: false, type: "success", message: "" });

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSliderBanner(banner.image_name);
      setAlert({ open: true, type: "success", message: "Banner salvo com sucesso!" });
    } catch (error) {
      setAlert({ open: true, type: "error", message: error instanceof Error ? error.message : "Erro ao salvar banner." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="font-inter relative p-4 rounded-2xl border-2 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-white border-blue-200">
      {/* Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        <div className={`
          px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1
          ${isClickable ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}
        `}>
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
        {/* Imagem */}
        <div className="relative group">
          <div className="relative w-full h-35 sm:h-70 lg:h-40 rounded-xl overflow-hidden border-2 border-blue-100 shadow-md">
            {banner.image_url ? (
              <>
                <Image 
                  src={banner.image_url} 
                  alt={banner.image_alt || `Banner ${index + 1}`}
                  fill
                  sizes="100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className={`
                  absolute inset-0 transition-colors duration-200
                  ${isClickable
                    ? 'bg-black/0 group-hover:bg-blue-500/20' 
                    : 'bg-black/0 group-hover:bg-gray-500/20'
                  }
                `} />
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
          </div>
        </div>

        {/* Upload */}
        <div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageUpload(banner.image_name, file);
            }}
            disabled={isUploading}
            className="hidden"
            id={`upload-slider-${banner.image_name}`}
          />
          <label
            htmlFor={`upload-slider-${banner.image_name}`}
            className={`
              w-full flex items-center justify-center gap-2 p-2 rounded-xl border-2 border-dashed 
              transition-all cursor-pointer
              ${isUploading 
                ? 'border-blue-300 bg-blue-50 text-blue-600 cursor-not-allowed' 
                : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50 text-blue-700'
              }
            `}
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
                  {banner.image_url ? 'Trocar Imagem' : 'Enviar Imagem'}
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
              onUpdate(banner.image_name, 'patrocinador_id', value === '' ? null : value);
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

        {/* Botões de ação */}
        <div className="flex flex-row gap-2 w-full">
          <button
            type="button"
            onClick={() => {
              const newClickable = !isClickable;
              onUpdate(banner.image_name, 'is_clickable', newClickable);
              if (!newClickable) {
                onUpdate(banner.image_name, 'patrocinador_id', null);
              }
            }}
            className={`
              flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-xl font-medium 
              transition-all text-xs
              ${isClickable 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-400 hover:bg-gray-500 text-white'
              }
            `}
          >
            {isClickable ? <FiMousePointer size={12} /> : <FiHome size={12} />}
            <span>{isClickable ? 'Clicável' : 'Não Clicável'}</span>
          </button>
          {banner.id && !banner.id.startsWith('mock-') && banner.image_url && (
            <button
              type="button"
              onClick={() => onDelete(banner.image_name)}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-xs transition-all"
              title="Excluir banner"
            >
              <FiTrash2 size={12} />
              Excluir
            </button>
          )}
        </div>

        {/* Botão de salvar individual */}
        <div className="mt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full flex items-center justify-center gap-2 px-2 py-2 rounded-xl font-semibold transition-all text-xs bg-green-500 hover:bg-green-600 text-white disabled:opacity-60"
          >
            {saving ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <FiUpload size={14} />
            )}
            <span>Salvar este banner</span>
          </button>
        </div>
      </div>

      <AlertModal
        open={alert.open}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ ...alert, open: false })}
      />
    </div>
  );
}

interface BannerSectionProps {
  title: string;
  banners: SliderBanner[];
  onImageUpload: (imageName: string, file: File) => void;
  onDelete: (imageName: string) => void;
  onUpdate: (imageName: string, field: keyof SliderBanner, value: SliderBannerUpdateValue) => void;
  patrocinadores: Array<{ id: string; nome: string }>;
  uploadingImages: Record<string, boolean>;
  saveSliderBanner: (imageName: string) => Promise<void>;
  loading: boolean;
}

function BannerSection({
  title,
  banners,
  onImageUpload,
  onDelete,
  onUpdate,
  patrocinadores,
  uploadingImages,
  saveSliderBanner,
  loading
}: BannerSectionProps & { saveSliderBanner: (imageName: string) => Promise<void>; loading: boolean }) {
  return (
    <div>
      <h3 className="text-sm sm:text-lg font-poppins font-bold text-blue-900 mb-4 flex items-center gap-2">
        {title}
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {banners.map((banner, index) => (
          <BannerCard
            key={banner.image_name}
            banner={banner}
            index={index}
            onImageUpload={onImageUpload}
            onDelete={onDelete}
            onUpdate={onUpdate}
            patrocinadores={patrocinadores}
            isUploading={uploadingImages[banner.image_name] || false}
            saveSliderBanner={saveSliderBanner}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}

export default function SliderConfiguration({ isVisible, onClose }: SliderConfigurationProps) {
  const { patrocinadores } = usePatrocinadores();
  const {
    sliderBanners,
    loading,
    uploadingImages,
    loadSliderBanners,
    updateSliderBanner,
    uploadAndUpdateBanner, // Usar a nova função otimizada
    deleteSliderBanner,
    saveSliderBanner,
    saveAllSliderBanners
  } = useSliderConfig();

  const [confirmDelete, setConfirmDelete] = useState<{ imageName: string } | null>(null);

  useEffect(() => {
    if (isVisible) {
      loadSliderBanners();
    }
  }, [isVisible, loadSliderBanners]);

  // NOVA FUNÇÃO DE UPLOAD OTIMIZADA
  const handleImageUpload = async (imageName: string, file: File) => {
    console.log(`🔄 Iniciando upload otimizado para: ${imageName}`);
    
    try {
      await uploadAndUpdateBanner(imageName, file);
      console.log(`✅ Upload e atualização concluídos para: ${imageName}`);
    } catch (error) {
      console.error(`❌ Erro no upload otimizado:`, error);
      alert(`Erro ao fazer upload da imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleDeleteBanner = async (imageName: string) => {
    setConfirmDelete({ imageName });
  };

  const confirmDeleteBanner = async () => {
    if (confirmDelete) {
      try {
        await deleteSliderBanner(confirmDelete.imageName);
      } catch {
        alert('Erro ao excluir banner. Tente novamente.');
      } finally {
        setConfirmDelete(null);
      }
    }
  };

  const handleUpdate = (imageName: string, field: keyof SliderBanner, value: SliderBannerUpdateValue) => {
    updateSliderBanner(imageName, field, value);
  };

  // Estado para controle de salvamento em lote
  const [savingAll, setSavingAll] = useState(false);

  const handleSaveAll = async () => {
    setSavingAll(true);
    try {
      await saveAllSliderBanners();
      alert('Todos os banners foram salvos com sucesso!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar todos os banners.');
    } finally {
      setSavingAll(false);
    }
  };

  if (!isVisible) return null;

  const principalBanners = sliderBanners.filter(banner => banner.image_name.startsWith('principal'));
  const secundarioBanners = sliderBanners.filter(banner => banner.image_name.startsWith('secundario'));

  return (
    <section className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 border border-blue-100 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-2xl">
            <FiSettings className="text-blue-600" size={20} />
          </div>
          <div>
            <h2 className="font-poppins text-sm sm:text-xl font-bold text-blue-900">
              Configurar Sliders da Homepage
            </h2>
          </div>
        </div>
        
        {/* Botões de ação alinhados */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadSliderBanners}
            disabled={loading}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="Recarregar configurações"
          >
            <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={loading || savingAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold bg-green-600 hover:bg-green-700 text-white transition-all disabled:opacity-60"
            title="Salvar todos os banners"
          >
            {savingAll ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <FiUpload size={16} />
            )}
            <span>Salvar Todos</span>
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

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          <span className="ml-3 text-blue-700 font-medium">Carregando configurações...</span>
        </div>
      ) : (
        <div className="space-y-8">
          <BannerSection
            title="Slider Principal (Superior)"
            banners={principalBanners}
            onImageUpload={handleImageUpload}
            onDelete={handleDeleteBanner}
            onUpdate={handleUpdate}
            patrocinadores={patrocinadores}
            uploadingImages={uploadingImages}
            saveSliderBanner={saveSliderBanner}
            loading={loading}
          />

          <BannerSection
            title="Slider Secundário (Inferior)"
            banners={secundarioBanners}
            onImageUpload={handleImageUpload}
            onDelete={handleDeleteBanner}
            onUpdate={handleUpdate}
            patrocinadores={patrocinadores}
            uploadingImages={uploadingImages}
            saveSliderBanner={saveSliderBanner}
            loading={loading}
          />
        </div>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="Excluir Banner"
        message="Deseja excluir este banner permanentemente?"
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDeleteBanner}
        onCancel={() => setConfirmDelete(null)}
      />
    </section>
  );
}