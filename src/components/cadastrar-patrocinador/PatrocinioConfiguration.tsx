'use client';

import React, { useEffect, useState } from 'react';
import { FiSettings, FiX, FiImage, FiUpload, FiMousePointer, FiHome, FiRefreshCw } from 'react-icons/fi';
import { usePatrocinioConfig } from '@/hooks/cadastrar-patrocinador/usePatrocinioConfig';
import { useFileUpload } from '@/hooks/cadastrar-patrocinador/useFileUpload';
import { usePatrocinadores } from '@/hooks/cadastrar-patrocinador/usePatrocinadores';
import Image from "next/image";
import { PatrocinioConfig } from '@/types/cadastrar-patrocinador';

// Tipagem para patrocinador
interface Patrocinador {
  id: string;
  nome: string;
  slug?: string;
}

// Tipagem para o valor de atualização
type PatrocinioUpdateValue = string | boolean | number | null;

// Tipagem para config do card (ajuste image_alt para aceitar null)
interface PatrocinioCardProps {
  config: {
    position: number;
    image_name?: string;
    image_url?: string | null;
    image_alt?: string | null;
    patrocinador_id?: string | null;
    is_active?: boolean;
    is_clickable?: boolean;
    id?: string;
  };
  positionInfo: { name: string };
  isUploading: boolean;
  patrocinadores: Patrocinador[];
  updatePatrocinioConfig: (position: number, field: keyof PatrocinioConfig, value: PatrocinioUpdateValue) => void;
  savePatrocinioConfig: (position: number) => Promise<void>;
  handleImageUpload: (position: number, file: File) => Promise<void>;
}

function PatrocinioCard({
  config,
  positionInfo,
  isUploading,
  patrocinadores,
  updatePatrocinioConfig,
  savePatrocinioConfig,
  handleImageUpload
}: PatrocinioCardProps) {
  const isClickable = config.is_clickable === true;
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePatrocinioConfig(config.position);
      alert('Configuração salva com sucesso!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar configuração.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      key={`${config.position}-${config.image_name || config.id}`}
      className={`relative p-3 rounded-2xl border-2 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200`}
    >
      {/* Status Badge */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <div className={`px-1.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 bg-blue-500 text-white`}>
          <FiMousePointer size={8} />
          {isClickable ? 'CLICK' : 'HOME'}
        </div>
      </div>

      <div className="space-y-2">
        {/* Imagem */}
        <div className="relative group">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-blue-100 shadow-sm">
            {config.image_url ? (
              <Image 
                src={config.image_url} 
                alt={config.image_alt || positionInfo.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                <FiImage size={16} className="text-gray-400 mb-1" />
                <span className="text-gray-500 text-xs">Sem imagem</span>
              </div>
            )}
            <div className="absolute bottom-1 left-1 bg-white/90 backdrop-blur-sm text-blue-900 px-1 py-0.5 rounded text-xs font-bold">
              #{config.position + 1}
            </div>
            <div className="absolute top-1 left-1 bg-green-500 text-white px-1 py-0.5 rounded text-xs font-bold">
              ● ATIVO
            </div>
          </div>
        </div>

        {/* Upload */}
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) await handleImageUpload(config.position, file);
            }}
            disabled={isUploading}
            className="hidden"
            id={`upload-patrocinio-${config.position}`}
          />
          <label
            htmlFor={`upload-patrocinio-${config.position}`}
            className={`w-full flex items-center justify-center gap-1 p-1.5 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
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
                <FiUpload size={10} />
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
            onChange={async (e) => {
              const value = e.target.value;
              updatePatrocinioConfig(config.position, 'patrocinador_id', value === '' ? null : value);
              updatePatrocinioConfig(config.position, 'is_active', true);
            }}
            className="w-full p-1.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all text-xs"
          >
            <option value="">
              {isClickable ? 'Selecionar (obrigatório)' : 'Selecionar (opcional)'}
            </option>
            {patrocinadores.map((patrocinador: Patrocinador) => (
              <option key={patrocinador.id} value={patrocinador.id}>
                {patrocinador.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Botão de Clicabilidade */}
        <button
          type="button"
          onClick={async () => {
            const newClickable = !isClickable;
            updatePatrocinioConfig(config.position, 'is_clickable', newClickable);
            updatePatrocinioConfig(config.position, 'is_active', true);
            if (!newClickable) {
              updatePatrocinioConfig(config.position, 'patrocinador_id', null);
            }
          }}
          className={`w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg font-medium transition-all text-xs ${
            isClickable 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-gray-400 hover:bg-gray-500 text-white'
          }`}
        >
          {isClickable ? <FiMousePointer size={10} /> : <FiHome size={10} />}
          <span>{isClickable ? 'Clicável' : 'Não Clicável'}</span>
        </button>

        {/* Botão de salvar individual */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || isUploading}
          className={`w-full mt-2 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg font-medium transition-all text-xs
            ${saving ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}
          `}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <FiSettings size={10} />
              <span>Salvar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

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
      updatePatrocinioConfig(position, 'is_active', true);
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
    } finally {
      setPositionUploading(position, false);
    }
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
        /* Grid das Posições - Otimizado para 6 colunas */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {patrocinioConfigs.map((config) => (
            <PatrocinioCard
              key={`${config.position}-${config.image_name || config.id}`}
              config={config}
              positionInfo={getPatrocinioPositionInfo(config.position)}
              isUploading={uploadingPositions[config.position]}
              patrocinadores={patrocinadores}
              updatePatrocinioConfig={updatePatrocinioConfig}
              savePatrocinioConfig={savePatrocinioConfig}
              handleImageUpload={handleImageUpload}
            />
          ))}
        </div>
      )}
    </section>
  );
}