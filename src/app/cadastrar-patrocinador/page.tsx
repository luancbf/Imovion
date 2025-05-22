'use client';

import { useEffect, useState, useCallback } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { FiEdit2, FiTrash2, FiUpload, FiX } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import useAuthGuard from '@/hooks/useAuthGuard';
import { getAuth } from 'firebase/auth';
import Image from 'next/image';

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
    setCarregando(true);
    try {
      const snapshot = await getDocs(collection(db, 'patrocinadores'));
      const lista: Patrocinador[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Patrocinador, 'id'>),
      }));
      setPatrocinadores(lista);
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
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-gray-100 to-blue-200 flex flex-col">
      {/* Header fixo */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur shadow-md flex justify-between items-center px-6 py-4 mb-6">
        <h1 className="text-2xl md:text-4xl font-extrabold text-blue-800 tracking-tight">
          Cadastrar Patrocinador
        </h1>
        <button
          onClick={() => router.push('/cadastrar-imovel')}
          className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-5 py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-500 transition font-semibold cursor-pointer"
        >
          Voltar
        </button>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-2 md:px-8 flex flex-col gap-8">
        {/* Formulário destacado */}
        <section className="bg-white/90 rounded-2xl shadow-lg p-6 md:p-10 mt-2 mb-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label htmlFor="nome" className="block mb-2 font-medium text-blue-900">
                  Nome do Patrocinador*
                </label>
                <input
                  id="nome"
                  type="text"
                  placeholder="Ex: Construtora ABC"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-3 bg-white text-black border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  required
                />
              </div>
              <div>
                <label htmlFor="imagem" className="block mb-2 font-medium text-blue-900">
                  {editandoId ? 'Nova Imagem (opcional)' : 'Imagem do Patrocinador*'}
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer bg-blue-100 text-blue-800 p-3 rounded-lg border border-blue-200 hover:bg-blue-200 transition-colors font-semibold">
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
                      title="Remover imagem"
                    >
                      <FiX size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            {preview && (
              <div className="mt-6 flex flex-col items-center">
                <p className="text-blue-900 mb-2">Pré-visualização:</p>
                <Image
                  src={preview}
                  alt="Preview"
                  width={128}
                  height={128}
                  className="w-32 h-32 object-contain rounded border-2 border-blue-200 bg-white"
                />
              </div>
            )}
            <div className="mt-8 flex flex-col md:flex-row gap-4">
              <button
                type="submit"
                disabled={carregando}
                className="w-full md:w-auto bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-400"
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
              {editandoId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full md:w-auto bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FiX /> Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Lista de patrocinadores */}
        <section className="bg-white/80 rounded-xl shadow p-4 md:p-8 flex flex-col gap-4 w-full max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="text-lg md:text-2xl font-bold text-blue-900">
              Patrocinadores Cadastrados
            </h2>
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Buscar patrocinador..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full p-2 pl-10 bg-white text-black border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
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
              <span className="text-blue-700">Carregando patrocinadores...</span>
            </div>
          ) : patrocinadoresFiltrados.length === 0 ? (
            <div className="text-center py-10 bg-blue-50 rounded">
              <span className="text-blue-700">
                {busca ? 'Nenhum patrocinador encontrado' : 'Nenhum patrocinador cadastrado'}
              </span>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-7 mt-2">
              {patrocinadoresFiltrados.map((p) => (
                <li
                  key={p.id}
                  className="border border-blue-200 p-4 rounded-xl bg-white hover:bg-blue-50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <Image
                      src={p.imagem}
                      alt={p.nome}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-200 bg-white"
                    />
                    <div>
                      <h3 className="text-blue-900 font-medium">{p.nome}</h3>
                      <p className="text-gray-500 text-sm">
                        {p.criadoEm instanceof Date
                          ? p.criadoEm.toLocaleDateString('pt-BR')
                          : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-2 text-yellow-600 hover:text-yellow-500 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 text-red-600 hover:text-red-500 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}