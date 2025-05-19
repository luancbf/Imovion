'use client';

import { useState, useRef } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getAuth } from 'firebase/auth';

interface FormularioImovelProps {
  patrocinadores: { id: string; nome: string }[];
  cidadesComBairros: Record<string, string[]>;
  opcoesTipoImovel: Record<string, string[]>;
  onSuccess?: () => void;
  dadosIniciais?: Partial<{
    cidade: string;
    bairro: string;
    enderecoDetalhado: string;
    valor: string;
    metragem: string;
    descricao: string;
    tipoImovel: string;
    tipoNegocio: string;
    setorNegocio: string;
    whatsapp: string;
    patrocinador: string;
    imagens: string[];
  }>;
}

export default function FormularioImovel({ 
  patrocinadores, 
  cidadesComBairros, 
  opcoesTipoImovel,
  onSuccess,
  dadosIniciais
}: FormularioImovelProps) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formulario, setFormulario] = useState({
    cidade: dadosIniciais?.cidade || '',
    bairro: dadosIniciais?.bairro || '',
    enderecoDetalhado: dadosIniciais?.enderecoDetalhado || '',
    valor: dadosIniciais?.valor || '',
    metragem: dadosIniciais?.metragem || '',
    descricao: dadosIniciais?.descricao || '',
    tipoImovel: dadosIniciais?.tipoImovel || '',
    setorNegocio: dadosIniciais?.setorNegocio || '',
    tipoNegocio: dadosIniciais?.tipoNegocio || '',
    whatsapp: dadosIniciais?.whatsapp || '',
    patrocinador: dadosIniciais?.patrocinador || '',
    imagens: [] as File[],
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const filesArray = Array.from(e.target.files);
      setFormulario({ ...formulario, imagens: filesArray });
      setPreviews(filesArray.map(file => URL.createObjectURL(file)));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      const filesArray = Array.from(e.dataTransfer.files);
      setFormulario({ ...formulario, imagens: filesArray });
      setPreviews(filesArray.map(file => URL.createObjectURL(file)));
    }
  };

  const removeImagem = (index: number) => {
    const novasImagens = formulario.imagens.filter((_, i) => i !== index);
    setFormulario({ ...formulario, imagens: novasImagens });
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const uploadImagens = async (imagens: File[]) => {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    const urls: string[] = [];
    for (const imagem of imagens) {
      if (!imagem.type.startsWith('image/')) continue;
      if (imagem.size > 5 * 1024 * 1024) throw new Error(`A imagem ${imagem.name} excede o limite de 5MB`);
      const storageRef = ref(storage, `imoveis/${user.uid}/${Date.now()}_${imagem.name}`);
      const snapshot = await uploadBytes(storageRef, imagem);
      urls.push(await getDownloadURL(snapshot.ref));
    }
    return urls;
  };

  const formatarParaMoeda = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    const numeroFloat = (parseInt(numeros) / 100).toFixed(2);
    return Number(numeroFloat).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarMetragem = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    return numeros ? `${numeros} m²` : '';
  };

  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 10) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'valor') setFormulario({ ...formulario, valor: formatarParaMoeda(value) });
    else if (name === 'metragem') setFormulario({ ...formulario, metragem: formatarMetragem(value) });
    else if (name === 'whatsapp') setFormulario({ ...formulario, whatsapp: formatarTelefone(value) });
    else setFormulario({ ...formulario, [name]: value });
  };

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    try {
      if (formulario.imagens.length === 0 && !dadosIniciais?.imagens?.length) {
        throw new Error('Por favor, adicione pelo menos uma imagem');
      }
      const urlsImagens = formulario.imagens.length > 0 
        ? await uploadImagens(formulario.imagens)
        : dadosIniciais?.imagens || [];
      const dadosImovel = {
        cidade: formulario.cidade,
        bairro: formulario.bairro,
        enderecoDetalhado: formulario.enderecoDetalhado,
        valor: Number(formulario.valor.replace(/\D/g, '')) / 100,
        metragem: Number(formulario.metragem.replace(/\D/g, '')),
        descricao: formulario.descricao,
        tipoImovel: formulario.tipoImovel,
        tipoNegocio: formulario.tipoNegocio,
        setorNegocio: formulario.setorNegocio,
        whatsapp: formulario.whatsapp.replace(/\D/g, ''),
        patrocinador: formulario.patrocinador || null,
        imagens: urlsImagens,
        dataCadastro: new Date(),
      };
      await addDoc(collection(db, 'imoveis'), dadosImovel);
      alert('Imóvel cadastrado com sucesso!');
      setFormulario({
        cidade: '',
        bairro: '',
        enderecoDetalhado: '',
        valor: '',
        metragem: '',
        descricao: '',
        tipoImovel: '',
        setorNegocio: '',
        tipoNegocio: '',
        whatsapp: '',
        patrocinador: '',
        imagens: [],
      });
      setPreviews([]);
      if (typeof onSuccess === 'function') onSuccess();
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao cadastrar imóvel.');
    } finally {
      setCarregando(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <form onSubmit={enviarFormulario} className="space-y-4">
      <select
        name="tipoNegocio"
        value={formulario.tipoNegocio}
        onChange={handleChange}
        className="w-full p-2 bg-gray-500 text-white border rounded cursor-pointer"
        required
      >
        <option value="">Setor de negociação</option>
        <option value="Residencial">Residencial</option>
        <option value="Comercial">Comercial</option>
        <option value="Rural">Rural</option>
      </select>

      {formulario.tipoNegocio && (
        <select
          name="setorNegocio"
          value={formulario.setorNegocio}
          onChange={handleChange}
          className="w-full p-2 bg-gray-500 text-white border rounded cursor-pointer"
          required
        >
          <option value="">Tipo de negócio</option>
          <option value="Aluguel">Aluguel</option>
          <option value="Venda">Venda</option>
        </select>
      )}

      {formulario.tipoNegocio && formulario.setorNegocio && (
        <select
          name="tipoImovel"
          value={formulario.tipoImovel}
          onChange={handleChange}
          className="w-full p-2 bg-gray-500 text-white border rounded cursor-pointer"
          required
        >
          <option value="">Tipo de imóvel</option>
          {(opcoesTipoImovel[`${formulario.tipoNegocio}-${formulario.setorNegocio}`] || []).map((opcao) => (
            <option key={opcao} value={opcao}>
              {opcao}
            </option>
          ))}
        </select>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={triggerFileInput}
        className="border-dashed border-2 p-4 rounded text-center text-gray-600 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
      >
        <p>Arraste e solte imagens aqui ou clique para selecionar</p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          required={!dadosIniciais?.imagens?.length && formulario.imagens.length === 0}
        />
        <div className="flex flex-wrap gap-2 mt-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative w-24 h-24">
              <Image
                src={preview}
                alt={`Preview ${index}`}
                fill
                className="object-cover rounded"
              />
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  removeImagem(index);
                }}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        {dadosIniciais?.imagens?.length ? (
          <p className="text-sm text-gray-500 mt-2">
            {dadosIniciais.imagens.length} imagem(ns) já cadastrada(s)
          </p>
        ) : null}
      </div>
      
      <input 
        name="valor" 
        placeholder="Preço" 
        value={formulario.valor} 
        onChange={handleChange} 
        className="w-full p-2 border rounded" 
        required 
      />
      
      <select 
        name="cidade" 
        value={formulario.cidade} 
        onChange={handleChange} 
        className="w-full p-2 bg-gray-500 text-white border rounded cursor-pointer" 
        required
      >
        <option value="">Selecione a cidade</option>
        {Object.keys(cidadesComBairros).map((cidade) => (
          <option key={cidade} value={cidade}>
            {cidade.replace(/_/g, ' ')}
          </option>
        ))}
      </select>

      <select 
        name="bairro" 
        value={formulario.bairro} 
        onChange={handleChange} 
        className="w-full p-2 bg-gray-500 text-white border rounded cursor-pointer" 
        required
      >
        <option value="">Selecione o bairro</option>
        {(cidadesComBairros[formulario.cidade] ?? []).map((bairro) => (
          <option key={bairro} value={bairro}>
            {bairro}
          </option>
        ))}
      </select>

      <input 
        name="enderecoDetalhado" 
        placeholder="Endereço (rua, número, complemento...)" 
        value={formulario.enderecoDetalhado} 
        onChange={handleChange} 
        className="w-full p-2 border rounded" 
        required 
      />

      <input 
        name="metragem" 
        placeholder="Metragem (m²)" 
        value={formulario.metragem} 
        onChange={handleChange} 
        className="w-full p-2 border rounded" 
        required 
      />

      <textarea 
        name="descricao" 
        placeholder="Descrição" 
        value={formulario.descricao} 
        onChange={handleChange} 
        className="w-full p-2 border rounded" 
        rows={4} 
        required 
      />
      
      <input 
        name="whatsapp" 
        placeholder="WhatsApp (com DDD)" 
        value={formulario.whatsapp} 
        onChange={handleChange} 
        className="w-full p-2 border rounded" 
        required 
      />

      <select
        name="patrocinador"
        value={formulario.patrocinador}
        onChange={handleChange}
        className="w-full p-2 bg-gray-500 text-white border rounded"
        disabled={patrocinadores.length === 0}
      >
        <option value="">
          {patrocinadores.length > 0
            ? 'Selecionar patrocinador (opcional)'
            : 'Nenhum patrocinador cadastrado'}
        </option>
        {patrocinadores.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome}
          </option>
        ))}
      </select>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.push('/cadastrar-patrocinador')}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded transition-colors"
        >
          Gerenciar Patrocinadores
        </button>
        
        <button 
          type="submit" 
          disabled={carregando} 
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors disabled:bg-gray-400"
        >
          {carregando ? 'Salvando...' : 'Salvar Imóvel'}
        </button>
      </div>
    </form>
  );
}