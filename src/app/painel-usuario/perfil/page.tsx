"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiEdit3 } from "react-icons/fi";

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  role: string;
  created_at: string;
}

export default function PerfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    cidade: "",
    estado: "",
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
        telefone: profile.telefone || "",
        cidade: profile.cidade || "",
        estado: profile.estado || "",
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
      const { error } = await supabase
        .from("profiles")
        .update({
          nome: formData.nome,
          telefone: formData.telefone,
          cidade: formData.cidade,
          estado: formData.estado,
        })
        .eq("id", profile.id);

      if (error) {
        console.error("Erro ao atualizar perfil:", error);
        alert("Erro ao salvar alterações");
        return;
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
                  {profile.nome || "Nome não informado"}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{profile.email}</p>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {profile.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </span>
                </div>
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
                        telefone: profile.telefone || "",
                        cidade: profile.cidade || "",
                        estado: profile.estado || "",
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiUser size={16} className="inline mr-2" />
                    Nome Completo
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleChange('nome', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Digite seu nome completo"
                    />
                  ) : (
                    <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700">
                      {profile.nome || "Não informado"}
                    </div>
                  )}
                </div>

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

                {/* Cidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMapPin size={16} className="inline mr-2" />
                    Cidade
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => handleChange('cidade', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Digite sua cidade"
                    />
                  ) : (
                    <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700">
                      {profile.cidade || "Não informado"}
                    </div>
                  )}
                </div>

                {/* Estado */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  {editMode ? (
                    <select
                      value={formData.estado}
                      onChange={(e) => handleChange('estado', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    >
                      <option value="">Selecione um estado</option>
                      <option value="AC">Acre</option>
                      <option value="AL">Alagoas</option>
                      <option value="AP">Amapá</option>
                      <option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option>
                      <option value="CE">Ceará</option>
                      <option value="DF">Distrito Federal</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="GO">Goiás</option>
                      <option value="MA">Maranhão</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PA">Pará</option>
                      <option value="PB">Paraíba</option>
                      <option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option>
                      <option value="PI">Piauí</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="RO">Rondônia</option>
                      <option value="RR">Roraima</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option>
                      <option value="SE">Sergipe</option>
                      <option value="TO">Tocantins</option>
                    </select>
                  ) : (
                    <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700">
                      {profile.estado || "Não informado"}
                    </div>
                  )}
                </div>
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