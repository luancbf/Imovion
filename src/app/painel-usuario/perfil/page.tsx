"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FiUser, FiMail, FiPhone, FiSave, FiEdit3, FiBriefcase, FiAward } from "react-icons/fi";

interface UserProfile {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  role: string;
  created_at: string;
  categoria: string;
  creci?: string;
  corretor: boolean;
  is_corretor: boolean;
}

interface UpdateProfileData {
  nome: string;
  telefone: string;
  sobrenome?: string;
}

export default function PerfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    telefone: "",
  });

  const carregarPerfil = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Erro ao carregar perfil:", error);
        return;
      }

      setProfile(profile);
      setFormData({
        nome: profile.nome || "",
        sobrenome: profile.sobrenome || "",
        telefone: profile.telefone || "",
      });
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    carregarPerfil();
  }, [carregarPerfil]);

  const handleSalvar = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      // Preparar dados para atualização
      const updateData: UpdateProfileData = {
        nome: formData.nome,
        telefone: formData.telefone,
      };

      // Apenas incluir sobrenome se não for imobiliária
      if (!isImobiliaria()) {
        updateData.sobrenome = formData.sobrenome;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", profile.id);

      if (error) {
        console.error("Erro ao atualizar perfil:", error);
        alert(`Erro ao salvar alterações: ${error.message || 'Erro desconhecido'}`);
        return;
      }

      // Se o telefone foi alterado, atualizar WhatsApp em todos os imóveis do usuário
      if (formData.telefone !== profile.telefone) {
        const { error: errorImoveis } = await supabase
          .from("imoveis")
          .update({ 
            whatsapp: formData.telefone,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", profile.id);

        if (errorImoveis) {
          console.warn("Erro ao atualizar WhatsApp nos imóveis:", errorImoveis);
          // Não bloquear o salvamento do perfil por causa dos imóveis
        } else {
          console.log("WhatsApp atualizado em todos os imóveis do usuário");
        }
      }

      // Atualizar o profile local
      setProfile({
        ...profile,
        ...formData,
      });

      setEditMode(false);
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar alterações");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Função para formatar a categoria de forma correta
  const formatarCategoria = (categoria: string) => {
    switch(categoria) {
      case 'proprietario':
        return 'Proprietário';
      case 'corretor':
        return 'Corretor de Imóveis';
      case 'imobiliaria':
        return 'Imobiliária';
      case 'proprietario_com_plano':
        return 'Proprietário com Plano';
      default:
        return categoria || 'Não informado';
    }
  };

  // Verificar se é imobiliária (pode ser pela categoria ou pelos campos booleanos)
  const isImobiliaria = () => {
    return profile?.categoria === 'imobiliaria' || 
           profile?.corretor === true || 
           profile?.is_corretor === true;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Erro ao carregar perfil</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto p-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Meu Perfil</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card de Informações Básicas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUser size={32} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {isImobiliaria() 
                    ? (profile.nome || "Nome da imobiliária não informado")
                    : (profile.nome 
                        ? `${profile.nome}${profile.sobrenome ? ` ${profile.sobrenome}` : ''}`
                        : "Nome não informado"
                      )
                  }
                </h3>
                <p className="text-gray-600 text-sm mb-4">{profile.email}</p>
                <p className="text-gray-500 text-xs mt-4">
                  Membro desde: {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {/* Formulário de Edição */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Informações Pessoais</h3>
                <button
                  onClick={() => {
                    if (editMode) {
                      // Cancelar edição - restaurar dados originais
                      setFormData({
                        nome: profile.nome || "",
                        sobrenome: profile.sobrenome || "",
                        telefone: profile.telefone || "",
                      });
                    }
                    setEditMode(!editMode);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <FiEdit3 size={16} />
                  {editMode ? "Cancelar" : "Editar"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Nome */}
                <div className={isImobiliaria() ? "md:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiUser size={16} className="inline mr-2" />
                    {isImobiliaria() ? "Nome da Imobiliária" : "Nome"}
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleChange('nome', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder={isImobiliaria() ? "Digite o nome da imobiliária" : "Digite seu nome"}
                    />
                  ) : (
                    <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700">
                      {profile.nome || "Não informado"}
                    </div>
                  )}
                </div>

                {/* Sobrenome (apenas se NÃO for imobiliária) */}
                {!isImobiliaria() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiUser size={16} className="inline mr-2" />
                      Sobrenome
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.sobrenome}
                        onChange={(e) => handleChange('sobrenome', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        placeholder="Digite seu sobrenome"
                      />
                    ) : (
                      <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700">
                        {profile.sobrenome || "Não informado"}
                      </div>
                    )}
                  </div>
                )}

                {/* Email (não editável) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMail size={16} className="inline mr-2" />
                    E-mail
                  </label>
                  <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-500">
                    {profile.email}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">E-mail não pode ser alterado</p>
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiPhone size={16} className="inline mr-2" />
                    Telefone
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => handleChange('telefone', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="(11) 99999-9999"
                    />
                  ) : (
                    <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700">
                      {profile.telefone || "Não informado"}
                    </div>
                  )}
                </div>

                {/* Categoria (apenas informativo) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiBriefcase size={16} className="inline mr-2" />
                    Categoria
                  </label>
                  <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-700">
                    {formatarCategoria(profile.categoria)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Categoria não pode ser alterada</p>
                </div>

                {/* CRECI (apenas se tiver - informativo) */}
                {profile.creci && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiAward size={16} className="inline mr-2" />
                      CRECI
                    </label>
                    <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-700">
                      {profile.creci}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">CRECI não pode ser alterado</p>
                  </div>
                )}
              </div>

              {/* Botão de Salvar */}
              {editMode && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSalvar}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <FiSave size={16} />
                        Salvar Alterações
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}