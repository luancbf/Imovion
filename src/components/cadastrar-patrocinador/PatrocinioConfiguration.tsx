'use client';

import { useEffect } from 'react';
import { FiUpload, FiX, FiSave, FiToggleLeft, FiToggleRight, FiImage, FiSettings, FiEye, FiMousePointer, FiHome } from 'react-icons/fi';
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
    deletePatrocinioConfig,
    getPatrocinioPositionInfo,
    validatePatrocinioConfig,
    getActivePatrocinioConfigs,
    getTotalActiveConfigs,
    resetPatrocinioConfig
  } = usePatrocinioConfig();

  useEffect(() => {
    if (isVisible) {
      loadPatrocinioConfigs();
    }
  }, [isVisible, loadPatrocinioConfigs]);

    const handleImageUpload = async (position: number, file: File) => {
    setPositionUploading(position, true);
    try {
      // CORRIGIDO: Nome único com timestamp para evitar conflitos
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const fileName = `patrocinio-pos-${position + 1}-${timestamp}-${randomId}`;
      
      console.log(`📸 Iniciando upload para posição ${position} com nome: ${fileName}`);
      
      const imageUrl = await uploadPatrocinioImage(file, fileName);
      
      console.log(`✅ Upload concluído para posição ${position}:`, imageUrl);
      
      updatePatrocinioConfig(position, 'image_url', imageUrl);
      updatePatrocinioConfig(position, 'image_alt', `Patrocínio ${getPatrocinioPositionInfo(position).name}`);
      
    } catch (error) {
      console.error('❌ Erro no upload da posição', position, ':', error);
      alert(error instanceof Error ? error.message : 'Erro ao enviar imagem');
    } finally {
      setPositionUploading(position, false);
    }
  };

  const handleSaveConfig = async (position: number) => {
    try {
      console.log(`💾 Salvando configuração da posição ${position}`);
      await savePatrocinioConfig(position);
      console.log(`✅ Configuração da posição ${position} salva com sucesso`);
      // alert('Configuração salva com sucesso!'); // Opcional - remover se incomodar
    } catch (error) {
      console.error('❌ Erro ao salvar configuração da posição', position, ':', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar configuração');
    }
  };

  const handleDeleteConfig = async (position: number, configName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a configuração "${configName}"?`)) return;
    
    try {
      await deletePatrocinioConfig(position);
      alert('Configuração excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir configuração:', error);
      alert(error instanceof Error ? error.message : 'Erro ao excluir configuração');
    }
  };

  const handleReset = (position: number, configName: string) => {
    if (!confirm(`Tem certeza que deseja resetar a configuração "${configName}"?`)) return;
    resetPatrocinioConfig(position);
  };

  // CORRIGIDO: Tipagem específica para PatrocinioConfig
  const canActivate = (config: PatrocinioConfig): boolean => {
    const isClickable = config.is_clickable === true;
    
    // Sempre precisa de imagem
    if (!config.image_url) return false;
    
    // Se for clicável, precisa de patrocinador
    if (isClickable && !config.patrocinador_id) return false;
    
    // Se não for clicável, só precisa da imagem
    return true;
  };

  // CORRIGIDO: Tipagem específica para PatrocinioConfig
  const getActivationError = (config: PatrocinioConfig): string | null => {
    const isClickable = config.is_clickable === true;
    
    if (!config.image_url) {
      return 'Envie uma imagem primeiro';
    }
    
    if (isClickable && !config.patrocinador_id) {
      return 'Selecione um patrocinador para modo clicável';
    }
    
    return null;
  };

  if (!isVisible) return null;

  const activeConfigs = getActivePatrocinioConfigs();
  
  // CORRIGIDO: Contagem de configurados com nova lógica
  const totalConfigured = patrocinioConfigs.filter((config: PatrocinioConfig) => {
    if (!config.image_url) return false; // Sempre precisa de imagem
    
    // Se for clicável, precisa de patrocinador
    if (config.is_clickable === true) {
      return config.patrocinador_id !== '' && config.patrocinador_id !== null;
    }
    
    // Se não for clicável, só precisa da imagem
    return true;
  }).length;
  
  const totalClickable = patrocinioConfigs.filter((config: PatrocinioConfig) => config.is_clickable === true).length;

  return (
    <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-green-100 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-2xl">
            <FiUpload className="text-green-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-green-900">
              🎯 Configurar Seção de Patrocínios
            </h2>
            <p className="text-green-600 text-sm">
              Configure até 8 posições com opções de clique para exibir na home
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={loadPatrocinioConfigs}
            disabled={loading}
            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
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
            title="Fechar configuração dos patrocínios"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* Preview dos Patrocínios Ativos */}
      <div className="mb-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
          <FiEye size={20} />
          Preview dos Patrocínios na Home
          {activeConfigs.length > 0 && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              {activeConfigs.length} ativo{activeConfigs.length !== 1 ? 's' : ''}
            </span>
          )}
        </h3>
        
        <div className="relative w-full min-h-32 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
          <div className="absolute inset-0 flex items-center justify-center p-4">
            {activeConfigs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 w-full">
                {activeConfigs.map((config: PatrocinioConfig) => {
                  const isClickable = config.is_clickable === true;
                  
                  return (
                    <div key={config.image_name} className="flex-shrink-0 relative group">
                      {/* Preview do comportamento de clique */}
                      <div className="relative cursor-pointer">
                        <Image
                          src={config.image_url!}
                          alt={config.image_alt || ''}
                          width={80}
                          height={80}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-white shadow-md transition-transform duration-300 group-hover:scale-110"
                        />
                        
                        {/* Overlay baseado na configuração de clique */}
                        <div className={`absolute inset-0 transition-colors duration-200 flex items-center justify-center ${
                          isClickable 
                            ? 'bg-black/0 group-hover:bg-green-500/20' 
                            : 'bg-black/0 group-hover:bg-gray-500/20'
                        }`}>
                          {isClickable ? (
                            <FiMousePointer className="text-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" size={16} />
                          ) : (
                            <FiHome className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" size={16} />
                          )}
                        </div>
                      </div>
                      
                      {/* Badges */}
                      <div className="absolute top-0 right-0 bg-green-600 text-white text-xs px-1 py-0.5 rounded-bl-md rounded-tr-lg font-bold">
                        {config.display_order + 1}
                      </div>
                      
                      {/* Badge indicativo do comportamento de clique */}
                      <div className={`absolute top-0 left-0 text-white p-1 rounded-br-lg rounded-tl-lg ${
                        isClickable ? 'bg-green-500' : 'bg-gray-500'
                      }`}>
                        {isClickable ? (
                          <FiMousePointer size={8} />
                        ) : (
                          <FiHome size={8} />
                        )}
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 py-0.5 rounded-b-lg truncate">
                        {config.patrocinadores?.nome || 'Sem patrocinador'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <FiImage size={48} className="mx-auto mb-3 opacity-50" />
                <h4 className="font-medium text-gray-600 mb-1">Nenhum patrocínio ativo</h4>
                <p className="text-sm text-gray-500">Configure e ative as posições abaixo para aparecerem no site</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas Atualizadas */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-8">
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiSettings className="text-green-600" size={18} />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Total Posições</p>
              <p className="text-xl font-bold text-green-900">{patrocinioConfigs.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FiToggleRight className="text-emerald-600" size={18} />
            </div>
            <div>
              <p className="text-sm text-emerald-600 font-medium">Ativos</p>
              <p className="text-xl font-bold text-emerald-900">{getTotalActiveConfigs()}</p>
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
              <p className="text-xl font-bold text-orange-900">
                {patrocinioConfigs.filter((c: PatrocinioConfig) => c.image_url).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiImage className="text-purple-600" size={18} />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Configurados</p>
              <p className="text-xl font-bold text-purple-900">{totalConfigured}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiMousePointer className="text-blue-600" size={18} />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Clicáveis</p>
              <p className="text-xl font-bold text-blue-900">{totalClickable}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent" />
          <span className="ml-3 text-green-700 font-medium">Carregando configurações dos patrocínios...</span>
        </div>
      ) : (
        /* Grid de Configurações */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {patrocinioConfigs.map((config: PatrocinioConfig, index: number) => {
            const positionInfo = getPatrocinioPositionInfo(index);
            const isUploading = uploadingPositions[index];
            const validation = validatePatrocinioConfig(index);
            const isClickable = config.is_clickable === true;
            
            // NOVA LÓGICA: Verificação flexível baseada no tipo de clique
            const canActivateConfig = canActivate(config);
            const activationError = getActivationError(config);
            
            return (
              <div 
                key={config.image_name} 
                className={`relative p-5 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 config-card ${
                  config.is_active 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                    : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
                }`}
                style={{ 
                  animationDelay: `${index * 0.05}s`,
                  animation: 'fadeInUp 0.5s ease-out forwards'
                }}
              >
                {/* Status Badges */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
                  {config.is_active ? (
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      ATIVO
                    </div>
                  ) : (
                    <div className="bg-gray-400 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                      INATIVO
                    </div>
                  )}
                  
                  {/* Badge de clicável */}
                  <div className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg ${
                    isClickable 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-500 text-white'
                  }`}>
                    {isClickable ? (
                      <>
                        <FiMousePointer size={10} />
                        CLICK
                      </>
                    ) : (
                      <>
                        <FiHome size={10} />
                        HOME
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Header */}
                  <div className="pr-16">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {positionInfo.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {positionInfo.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-700 text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-xs text-gray-500">Ordem de exibição</span>
                    </div>
                  </div>

                  {/* Imagem */}
                  <div className="relative group">
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-gray-100 shadow-md">
                      {config.image_url ? (
                        <>
                          <Image 
                            src={config.image_url} 
                            alt={config.image_alt || positionInfo.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className={`absolute inset-0 transition-colors duration-200 ${
                            isClickable
                              ? 'bg-black/0 group-hover:bg-green-500/20' 
                              : 'bg-black/0 group-hover:bg-gray-500/20'
                          }`} />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                          <FiImage size={24} className="text-gray-400 mb-1" />
                          <span className="text-gray-500 text-xs">Sem imagem</span>
                        </div>
                      )}
                      
                      {/* Indicador de posição */}
                      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-lg text-xs font-bold">
                        Pos. #{index + 1}
                      </div>

                      {/* Indicador de ativo */}
                      {config.is_active && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                          ● ATIVO
                        </div>
                      )}

                      {/* Indicador de clicável */}
                      <div className={`absolute top-2 right-2 text-white p-1 rounded-lg ${
                        isClickable ? 'bg-green-500' : 'bg-gray-500'
                      }`}>
                        {isClickable ? (
                          <FiMousePointer size={12} />
                        ) : (
                          <FiHome size={12} />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status do Patrocinador */}
                  {config.patrocinadores ? (
                    <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-green-800 text-sm font-medium truncate">
                          {config.patrocinadores.nome}
                        </p>
                      </div>
                    </div>
                  ) : isClickable ? (
                    <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <p className="text-yellow-800 text-sm font-medium">
                          ⚠️ Patrocinador obrigatório para modo clicável
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <p className="text-blue-800 text-sm font-medium">
                          🏠 Modo não clicável - patrocinador opcional
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Upload */}
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(index, file);
                        }
                      }}
                      disabled={isUploading}
                      className="hidden"
                      id={`upload-patrocinio-${index}`}
                    />
                    <label
                      htmlFor={`upload-patrocinio-${index}`}
                      className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
                        isUploading 
                          ? 'border-green-300 bg-green-50 text-green-600 cursor-not-allowed' 
                          : 'border-green-300 hover:border-green-400 hover:bg-green-50 text-green-700 transform hover:scale-[1.02]'
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent" />
                          <span className="text-sm font-medium">Enviando...</span>
                        </>
                      ) : (
                        <>
                          <FiUpload size={14} />
                          <span className="text-sm font-medium">
                            {config.image_url ? '🔄 Trocar' : '📁 Escolher'}
                          </span>
                        </>
                      )}
                    </label>
                    
                    <div className="text-xs text-gray-500 text-center">
                      Quadrada • Máx: 5MB
                    </div>
                  </div>

                  {/* Seleção de Patrocinador */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Patrocinador {isClickable && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={config.patrocinador_id || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        updatePatrocinioConfig(index, 'patrocinador_id', value === '' ? '' : value);
                      }}
                      className={`w-full p-2 text-sm border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200 ${
                        isClickable && !config.patrocinador_id 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-200'
                      }`}
                    >
                      <option value="">
                        {isClickable ? '🏢 Selecionar Patrocinador (obrigatório)' : '🏢 Selecionar Patrocinador (opcional)'}
                      </option>
                      {patrocinadores.map(patrocinador => (
                        <option key={patrocinador.id} value={patrocinador.id}>
                          {patrocinador.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Botão de Comportamento Simplificado */}
                  <div className="space-y-2">
                    <button
                      onClick={() => updatePatrocinioConfig(index, 'is_clickable', !isClickable)}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] ${
                        isClickable 
                          ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg' 
                          : 'bg-gray-400 hover:bg-gray-500 text-white shadow-lg'
                      }`}
                    >
                      {isClickable ? <FiMousePointer size={16} /> : <FiHome size={16} />}
                      <span className="text-sm">
                        {isClickable ? '🔗 Clicável' : '🏠 Não Clicável'}
                      </span>
                    </button>
                    
                    <div className={`text-xs text-center p-2 rounded-lg ${
                      isClickable 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}>
                      {isClickable 
                        ? `✅ Vai para: ${config.patrocinadores?.nome || 'página do patrocinador'}`
                        : '🏠 Vai para: Home'
                      }
                    </div>
                  </div>

                  {/* ATUALIZADO: Controles com Nova Lógica */}
                  <div className="space-y-2">
                    {/* Toggle Ativo/Inativo - NOVA LÓGICA */}
                    <button
                      onClick={() => updatePatrocinioConfig(index, 'is_active', !config.is_active)}
                      disabled={!canActivateConfig}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] ${
                        config.is_active 
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg' 
                          : canActivateConfig
                          ? 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed hover:scale-100'
                      }`}
                      title={activationError || undefined}
                    >
                      {config.is_active ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                      <span className="text-sm">
                        {config.is_active ? '✅ Ativo' : '⭕ Ativar'}
                      </span>
                    </button>
                    
                    {/* Mensagem de erro personalizada */}
                    {!canActivateConfig && activationError && (
                      <div className="text-xs text-red-600 text-center p-2 bg-red-50 rounded-lg border border-red-200">
                        ❌ {activationError}
                      </div>
                    )}
                    
                    {/* Botões de Ação */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleSaveConfig(index)}
                        disabled={config.is_active && !validation.valid}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-1 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100 text-sm"
                      >
                        <FiSave size={14} />
                        Salvar
                      </button>
                      
                      {config.image_url && (
                        <button
                          onClick={() => handleReset(index, positionInfo.name)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-1 transform hover:scale-[1.02] text-sm"
                        >
                          🔄 Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Menu de Ações Avançadas */}
                  {canActivateConfig && (
                    <details className="group">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        ⚙️ Ações Avançadas
                      </summary>
                      <div className="mt-2 space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <button
                          onClick={() => handleDeleteConfig(index, positionInfo.name)}
                          className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          🗑️ Excluir Configuração
                        </button>
                        
                        <div className="text-xs text-gray-500 text-center pt-1">
                          💡 Dica: Use &quot;Reset&quot; para limpar sem excluir
                        </div>
                      </div>
                    </details>
                  )}

                  {/* Alertas e Validações */}
                  {config.is_active && !validation.valid && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 animate-pulse">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-red-800 text-sm font-semibold">⚠️ Configuração incompleta</p>
                          <p className="text-red-600 text-xs mt-1">
                            {validation.error}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {canActivateConfig && !config.is_active && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-yellow-800 text-sm font-medium">
                          ✨ Pronto para ativar!
                          <span className="ml-1">
                            + {isClickable ? 'Clicável' : 'Home'}
                          </span>
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
            transform: translateY(15px);
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
        
        .config-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .config-card:hover {
          transform: translateY(-3px);
        }
      `}</style>
    </section>
  );
}