'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSave, FiX, FiUpload, FiImage } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { usePatrocinadores } from '@/hooks/cadastrar-patrocinador/usePatrocinadores';
import { useFileUpload } from '@/hooks/cadastrar-patrocinador/useFileUpload';
import { Patrocinador } from '@/types/cadastrar-patrocinador';
import Image from "next/image";

interface PatrocinadorFormProps {
  onSuccess?: () => void;
  editingPatrocinador?: Patrocinador | null;
  onCancelEdit?: () => void;
}

export default function PatrocinadorForm({ 
  onSuccess, 
  editingPatrocinador, 
  onCancelEdit 
}: PatrocinadorFormProps) {
  const { user } = useAuth();
  const { validatePatrocinador, gerarSlug, loadPatrocinadores } = usePatrocinadores();
  const { uploading, uploadBanner } = useFileUpload();
  
  // Estados
  const [nome, setNome] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Estados computados
  const isEditing = !!editingPatrocinador;
  const isDisabled = saving || uploading || !user?.id;

  // Resetar formulário
  const resetForm = useCallback(() => {
    setNome('');
    setBannerFile(null);
    setBannerPreview(null);
    setErrors({});
    onCancelEdit?.();
  }, [onCancelEdit]);

  // Carregar dados para edição
  useEffect(() => {
    if (editingPatrocinador) {
      setNome(editingPatrocinador.nome);
      setBannerPreview(editingPatrocinador.bannerUrl || null);
      setBannerFile(null);
    } else {
      resetForm();
    }
  }, [editingPatrocinador, resetForm]);

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else {
      const validation = validatePatrocinador(nome.trim(), editingPatrocinador?.id);
      if (!validation.valid) {
        newErrors.nome = validation.error || 'Nome inválido';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manipular upload de banner
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setErrors(prev => ({ ...prev, banner: '' }));
    
    if (!file) {
      setBannerFile(null);
      setBannerPreview(editingPatrocinador?.bannerUrl || null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, banner: 'Arquivo deve ser uma imagem' }));
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, banner: 'Imagem deve ter no máximo 5MB' }));
      return;
    }
    
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  // Tratamento de erro otimizado
  const getErrorMessage = (error: Error): string => {
    const msg = error.message.toLowerCase();
    
    if (msg.includes('duplicate') || msg.includes('unique')) {
      return 'Já existe um patrocinador com este nome';
    }
    if (msg.includes('permission')) {
      return 'Sem permissão para esta operação';
    }
    if (msg.includes('column')) {
      return 'Erro de configuração do banco';
    }
    if (msg.includes('network')) {
      return 'Erro de conexão';
    }
    
    return error.message;
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user?.id) return;
    
    setSaving(true);
    
    try {
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const dados = {
        nome: nome.trim(),
        slug: gerarSlug(nome.trim()),
        ownerId: user.id
      };

      let patrocinadorId = editingPatrocinador?.id;

      if (isEditing) {
        const { error } = await supabase
          .from('patrocinadores')
          .update(dados)
          .eq('id', editingPatrocinador.id);
        
        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await supabase
          .from('patrocinadores')
          .insert([dados])
          .select()
          .single();
        
        if (error) throw new Error(error.message);
        if (!data) throw new Error('Nenhum dado retornado');
        
        patrocinadorId = data.id;
      }

      // Upload do banner se houver
      if (patrocinadorId && bannerFile) {
        try {
          const bannerUrl = await uploadBanner(bannerFile, patrocinadorId);
          await supabase
            .from('patrocinadores')
            .update({ bannerUrl })
            .eq('id', patrocinadorId);
        } catch (uploadError) {
          console.warn('Erro no upload do banner:', uploadError);
        }
      }

      await loadPatrocinadores();
      resetForm();
      onSuccess?.();
      
      alert(isEditing ? 'Patrocinador atualizado!' : 'Patrocinador cadastrado!');
      
    } catch (error) {
      console.error('Erro:', error);
      alert(error instanceof Error ? getErrorMessage(error) : 'Erro inesperado');
    } finally {
      setSaving(false);
    }
  };

  // Botão de ação dinâmico
  const renderActionButton = () => {
    if (saving) {
      return (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          Salvando...
        </>
      );
    }
    
    if (uploading) {
      return (
        <>
          <FiUpload className="animate-bounce" size={18} />
          Enviando...
        </>
      );
    }
    
    if (!user?.id) {
      return (
        <>
          <FiX size={18} />
          Faça login
        </>
      );
    }
    
    return isEditing ? (
      <>
        <FiSave size={18} />
        Atualizar
      </>
    ) : (
      <>
        <FiPlus size={18} />
        Cadastrar
      </>
    );
  };

  return (
    <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-blue-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-2xl">
          <FiPlus className="text-blue-600" size={24} />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-blue-900">
            {isEditing ? 'Editar Patrocinador' : 'Novo Patrocinador'}
          </h2>
          <p className="text-blue-600 text-sm">
            {isEditing ? 'Atualize as informações' : 'Adicione um novo patrocinador'}
          </p>
        </div>
        
        {isEditing && (
          <button
            type="button"
            onClick={resetForm}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Cancelar edição"
          >
            <FiX size={20} />
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome */}
        <div>
          <label htmlFor="nome" className="block text-sm font-semibold text-blue-900 mb-2">
            Nome do Patrocinador*
          </label>
          <input
            id="nome"
            type="text"
            placeholder="Ex: Construtora ABC, Imobiliária XYZ..."
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setErrors(prev => ({ ...prev, nome: '' }));
            }}
            className={`w-full px-4 py-3 bg-blue-50 border rounded-xl transition-all ${
              errors.nome 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-blue-200 focus:ring-blue-500 focus:border-blue-500'
            }`}
            required
            disabled={isDisabled}
          />
          {errors.nome && (
            <p className="text-red-600 text-sm mt-1">⚠️ {errors.nome}</p>
          )}
        </div>
        
        {/* Banner */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-blue-900">
            Banner do Patrocinador
          </label>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload */}
            <div className="lg:col-span-2">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  disabled={isDisabled}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-dashed border-blue-300 rounded-xl p-4 hover:border-blue-400 transition-colors disabled:opacity-50"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                      <span className="text-sm font-medium">Enviando...</span>
                    </div>
                  </div>
                )}
              </div>
              
              {errors.banner && (
                <p className="text-red-600 text-sm mt-1">⚠️ {errors.banner}</p>
              )}
              
              <p className="text-gray-500 text-xs mt-2">
                JPG, PNG, GIF (máximo 5MB)
              </p>
            </div>
            
            {/* Preview */}
            <div className="flex justify-center lg:justify-start">
              {bannerPreview ? (
                <div className="relative group">
                  <Image
                    src={bannerPreview}
                    alt="Preview do banner"
                    width={200}
                    height={120}
                    className="w-48 h-28 object-cover rounded-xl border-2 border-blue-100 shadow-lg"
                  />
                  
                  {bannerFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setBannerFile(null);
                        setBannerPreview(editingPatrocinador?.bannerUrl || null);
                        setErrors(prev => ({ ...prev, banner: '' }));
                      }}
                      disabled={isDisabled}
                      className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      title="Remover imagem"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                  
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {bannerFile ? 'Nova imagem' : 'Imagem atual'}
                  </div>
                </div>
              ) : (
                <div className="w-48 h-28 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500">
                  <FiImage size={24} />
                  <span className="text-xs mt-1">Sem banner</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-blue-100">
          <button
            type="submit"
            disabled={isDisabled}
            className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            {renderActionButton()}
          </button>
          
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              disabled={isDisabled}
              className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 transform hover:scale-105 disabled:transform-none"
            >
              <FiX size={18} />
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
}