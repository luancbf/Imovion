'use client';

import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { FiPlus, FiSave, FiX, FiPhone, FiUser } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { usePatrocinadores } from '@/hooks/cadastrar-patrocinador/usePatrocinadores';
import { Patrocinador } from '@/types/cadastrar-patrocinador';

interface PatrocinadorFormProps {
  onSuccess?: () => void;
  editingPatrocinador?: Patrocinador | null;
  onCancelEdit?: () => void;
}

// ✅ NOVO: Interface para o ref
export interface PatrocinadorFormRef {
  scrollToForm: () => void;
}

const PatrocinadorForm = forwardRef<PatrocinadorFormRef, PatrocinadorFormProps>(({ 
  onSuccess, 
  editingPatrocinador, 
  onCancelEdit 
}, ref) => {
  const { user } = useAuth();
  // ✅ CORRIGIDO: Removido 'formatarTelefone' da importação pois não é usado
  const { validatePatrocinador, gerarSlug, loadPatrocinadores } = usePatrocinadores();
  
  // ✅ NOVO: Ref para o formulário
  const formRef = useRef<HTMLElement>(null);
  
  // Estados
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Estados computados
  const isEditing = !!editingPatrocinador;
  const isDisabled = saving || !user?.id;

  // ✅ NOVO: Função para formatação em tempo real do telefone
  const formatTelefoneRealTime = useCallback((value: string): string => {
    // Remove tudo que não é número
    const numeros = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedNumeros = numeros.slice(0, 11);
    
    // Aplica a formatação conforme o usuário digita
    if (limitedNumeros.length === 0) {
      return '';
    } else if (limitedNumeros.length <= 2) {
      return `(${limitedNumeros}`;
    } else if (limitedNumeros.length <= 6) {
      return `(${limitedNumeros.slice(0, 2)}) ${limitedNumeros.slice(2)}`;
    } else if (limitedNumeros.length <= 10) {
      return `(${limitedNumeros.slice(0, 2)}) ${limitedNumeros.slice(2, 6)}-${limitedNumeros.slice(6)}`;
    } else {
      // Para 11 dígitos (celular com 9)
      return `(${limitedNumeros.slice(0, 2)}) ${limitedNumeros.slice(2, 7)}-${limitedNumeros.slice(7, 11)}`;
    }
  }, []);

  // ✅ NOVO: Função para fazer scroll suave para o formulário
  const scrollToForm = useCallback(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
      // ✅ Adicionar um pequeno delay para garantir que o scroll aconteça
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.focus();
        }
      }, 500);
    }
  }, []);

  // ✅ NOVO: Expor a função através do ref
  useImperativeHandle(ref, () => ({
    scrollToForm
  }), [scrollToForm]);

  // Resetar formulário
  const resetForm = useCallback(() => {
    setNome('');
    setTelefone('');
    setErrors({});
    onCancelEdit?.();
  }, [onCancelEdit]);

  // Carregar dados para edição
  useEffect(() => {
    if (editingPatrocinador) {
      setNome(editingPatrocinador.nome);
      // ✅ CORRIGIDO: Aplicar formatação no telefone quando carregar para edição
      setTelefone(editingPatrocinador.telefone ? formatTelefoneRealTime(editingPatrocinador.telefone) : '');
      // ✅ NOVO: Fazer scroll quando carregar dados para edição
      setTimeout(() => {
        scrollToForm();
      }, 100);
    } else {
      resetForm();
    }
  }, [editingPatrocinador, resetForm, scrollToForm, formatTelefoneRealTime]);

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else {
      const validation = validatePatrocinador(nome.trim(), telefone.trim(), editingPatrocinador?.id);
      if (!validation.valid) {
        newErrors.nome = validation.error || 'Nome inválido';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ CORRIGIDO: Manipular mudança do telefone com formatação em tempo real
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Aplicar formatação em tempo real
    const formatted = formatTelefoneRealTime(value);
    setTelefone(formatted);
    
    // Limpar erro se existir
    setErrors(prev => ({ ...prev, telefone: '' }));
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
        telefone: telefone.trim() || null,
        ownerId: user.id
      };

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
    <section 
      ref={formRef} // ✅ NOVO: Ref para scroll
      tabIndex={-1} // ✅ NOVO: Permite focar no elemento
      className={`bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-blue-100 transition-all duration-500 ${
        isEditing ? 'ring-2 ring-blue-300 ring-opacity-50' : ''
      }`} // ✅ NOVO: Destaque visual quando editando
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-2xl transition-colors ${
          isEditing ? 'bg-amber-100' : 'bg-blue-100'
        }`}>
          <FiUser className={`${
            isEditing ? 'text-amber-600' : 'text-blue-600'
          }`} size={24} />
        </div>
        <div className="flex-1">
          <h2 className={`text-2xl font-bold transition-colors ${
            isEditing ? 'text-amber-900' : 'text-blue-900'
          }`}>
            {isEditing ? 'Editar Patrocinador' : 'Novo Patrocinador'}
          </h2>
          <p className={`text-sm transition-colors ${
            isEditing ? 'text-amber-600' : 'text-blue-600'
          }`}>
            {isEditing ? 
              `Editando: ${editingPatrocinador?.nome}` : 
              'Adicione um novo patrocinador com nome e telefone'
            }
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
          <label htmlFor="nome" className={`block text-sm font-semibold mb-2 transition-colors ${
            isEditing ? 'text-amber-900' : 'text-blue-900'
          }`}>
            Nome do Patrocinador*
          </label>
          <div className="relative">
            <FiUser className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
              isEditing ? 'text-amber-400' : 'text-blue-400'
            }`} size={20} />
            <input
              id="nome"
              type="text"
              placeholder="Ex: Construtora ABC, Imobiliária XYZ..."
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setErrors(prev => ({ ...prev, nome: '' }));
              }}
              className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all ${
                errors.nome 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                  : isEditing
                  ? 'border-amber-200 focus:ring-amber-500 focus:border-amber-500 bg-amber-50'
                  : 'border-blue-200 focus:ring-blue-500 focus:border-blue-500 bg-blue-50'
              }`}
              required
              disabled={isDisabled}
            />
          </div>
          {errors.nome && (
            <p className="text-red-600 text-sm mt-1">⚠️ {errors.nome}</p>
          )}
        </div>
        
        {/* ✅ CORRIGIDO: Campo Telefone com formatação em tempo real */}
        <div>
          <label htmlFor="telefone" className={`block text-sm font-semibold mb-2 transition-colors ${
            isEditing ? 'text-amber-900' : 'text-blue-900'
          }`}>
            Telefone
            <span className="text-gray-500 font-normal text-xs ml-1">(opcional)</span>
          </label>
          <div className="relative">
            <FiPhone className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
              isEditing ? 'text-amber-400' : 'text-blue-400'
            }`} size={20} />
            <input
              id="telefone"
              type="tel"
              placeholder="(65) 99999-1234"
              value={telefone}
              onChange={handleTelefoneChange}
              className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all ${
                errors.telefone 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                  : isEditing
                  ? 'border-amber-200 focus:ring-amber-500 focus:border-amber-500 bg-amber-50'
                  : 'border-blue-200 focus:ring-blue-500 focus:border-blue-500 bg-blue-50'
              }`}
              disabled={isDisabled}
              maxLength={15} // ✅ NOVO: Limitar caracteres para evitar telefones muito grandes
            />
          </div>
          {errors.telefone && (
            <p className="text-red-600 text-sm mt-1">⚠️ {errors.telefone}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            Formato automático: (65) 99999-1234 ou (65) 9999-1234
          </p>
        </div>
        
        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-blue-100">
          <button
            type="submit"
            disabled={isDisabled}
            className={`flex-1 sm:flex-none text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none cursor-pointer ${
              isEditing 
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
            }`}
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
});

PatrocinadorForm.displayName = 'PatrocinadorForm';

export default PatrocinadorForm;