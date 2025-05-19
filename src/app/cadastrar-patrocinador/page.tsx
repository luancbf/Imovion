'use client';

import { useEffect, useState, useCallback } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { FiEdit2, FiTrash2, FiUpload, FiX, FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import useAuthGuard from '@/hooks/useAuthGuard';
import { getAuth } from 'firebase/auth';

interface Patrocinador {
  id: string;
  nome: string;
  imagem: string;
  slug: string;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export default function CadastrarPatrocinador() {
  useAuthGuard();
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [busca, setBusca] = useState('');

  const gerarSlug = useCallback((texto: string) =>
    texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  , []);

  const carregarPatrocinadores = useCallback(async () => {
    try {
      setCarregando(true);
      const snapshot = await getDocs(collection(db, 'patrocinadores'));
      const lista: Patrocinador[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Patrocinador, 'id'>),
      }));
      setPatrocinadores(lista);
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarPatrocinadores();
  }, [carregarPatrocinadores]);

  useEffect(() => {
    if (!imagemFile) return;
    const url = URL.createObjectURL(imagemFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imagemFile]);

  const uploadImagem = async (file: File) => {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    const imageRef = ref(storage, `${user.uid}/${uuidv4()}`);
    const snapshot = await uploadBytes(imageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const validarFormulario = () => {
    const nomeTrim = nome.trim();
    if (nomeTrim.length < 3) {
      alert('O nome deve ter ao menos 3 caracteres.');
      return false;
    }
    if (!imagemFile && !editandoId) {
      alert('Por favor, selecione uma imagem.');
      return false;
    }
    const slug = gerarSlug(nomeTrim);
    const nomeRepetido = patrocinadores.some(
      (p) => p.slug === slug && p.id !== editandoId
    );
    if (nomeRepetido) {
      alert('Já existe um patrocinador com esse nome.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    setCarregando(true);
    try {
      let url = preview && !imagemFile ? preview : '';
      if (imagemFile) url = await uploadImagem(imagemFile);

      // Garante que o campo imagem sempre existe
      if (!url) {
        alert('Erro ao obter a URL da imagem.');
        setCarregando(false);
        return;
      }

      const dadosPatrocinador: Partial<Omit<Patrocinador, 'id'>> = {
        nome: nome.trim(),
        slug: gerarSlug(nome.trim()),
        imagem: url,
        ...(editandoId 
          ? { atualizadoEm: new Date() }
          : { criadoEm: new Date() })
      };

      if (editandoId) {
        await updateDoc(doc(db, 'patrocinadores', editandoId), dadosPatrocinador);
      } else {
        await addDoc(collection(db, 'patrocinadores'), dadosPatrocinador);
      }
      resetForm();
      await carregarPatrocinadores();
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setCarregando(false);
    }
  };

  const resetForm = () => {
    setNome('');
    setImagemFile(null);
    setPreview(null);
    setEditandoId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este patrocinador?')) return;
    try {
      await deleteDoc(doc(db, 'patrocinadores', id));
      await carregarPatrocinadores();
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error));
    }
  };

  const handleEdit = (p: Patrocinador) => {
    setNome(p.nome);
    setEditandoId(p.id);
    setPreview(p.imagem);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const patrocinadoresFiltrados = patrocinadores.filter(p =>
    (p.nome || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.push('/cadastrar-imovel')}
          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
        >
          <FiArrowLeft /> Voltar para Imóveis
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {editandoId ? 'Editar Patrocinador' : 'Cadastrar Patrocinador'}
        </h1>
        {editandoId && (
          <button
            onClick={resetForm}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
          >
            <FiX /> Cancelar Edição
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="nome" className="block mb-2 font-medium text-white">
              Nome do Patrocinador*
            </label>
            <input
              id="nome"
              type="text"
              placeholder="Ex: Construtora ABC"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="imagem" className="block mb-2 font-medium text-white">
              {editandoId ? 'Nova Imagem (opcional)' : 'Imagem do Patrocinador*'}
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer bg-gray-700 text-white p-3 rounded border border-gray-600 hover:bg-gray-600 transition-colors">
                <FiUpload className="inline mr-2" />
                {imagemFile ? imagemFile.name : 'Selecionar Imagem'}
                <input
                  id="imagem"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && !file.type.startsWith('image/')) {
                      alert('Por favor, selecione um arquivo de imagem válido.');
                      return;
                    }
                    setImagemFile(file || null);
                  }}
                  className="hidden"
                  required={!editandoId}
                />
              </label>
              {imagemFile && (
                <button
                  type="button"
                  onClick={() => setImagemFile(null)}
                  className="text-red-500 hover:text-red-400 transition-colors"
                >
                  <FiX size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
        {preview && (
          <div className="mt-4">
            <p className="text-white mb-2">Pré-visualização:</p>
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-contain rounded border-2 border-gray-500"
            />
          </div>
        )}
        <div className="mt-6">
          <button
            type="submit"
            disabled={carregando}
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-gray-500 flex items-center justify-center gap-2 transition-colors"
          >
            {carregando ? (
              'Processando...'
            ) : editandoId ? (
              <>
                <FiEdit2 /> Atualizar
              </>
            ) : (
              'Cadastrar Patrocinador'
            )}
          </button>
        </div>
      </form>

      <section className="bg-gray-800 p-6 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            Patrocinadores Cadastrados
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar patrocinador..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full md:w-64 p-2 pl-10 bg-gray-700 text-white border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        {carregando && patrocinadores.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-white">Carregando patrocinadores...</p>
          </div>
        ) : patrocinadoresFiltrados.length === 0 ? (
          <div className="text-center py-10 bg-gray-700 rounded">
            <p className="text-gray-400">
              {busca ? 'Nenhum patrocinador encontrado' : 'Nenhum patrocinador cadastrado'}
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patrocinadoresFiltrados.map((p) => (
              <li
                key={p.id}
                className="border border-gray-700 p-4 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={p.imagem}
                      alt={p.nome}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-500"
                    />
                    <div>
                      <h3 className="text-white font-medium">{p.nome}</h3>
                      <p className="text-gray-400 text-sm">
                        {p.criadoEm instanceof Date
                          ? p.criadoEm.toLocaleDateString('pt-BR')
                          : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-2 text-yellow-500 hover:text-yellow-400 hover:bg-gray-800 rounded transition-colors"
                      title="Editar"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 text-red-500 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                      title="Excluir"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}