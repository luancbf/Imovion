'use client';

import { useState, useRef } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import UploadImages from './formulario/UploadImages';
import SelectCidadeBairro from './formulario/SelectCidadeBairro';
import ItensImovel from './formulario/ItensImovel';
import { ITENS_POR_SETOR, ITENS_QUANTITATIVOS } from '@/constants/itensImovel';

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
    itens: Record<string, number>;
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

  const setorSelecionado = formulario.tipoNegocio;
  const itensDisponiveis = setorSelecionado ? ITENS_POR_SETOR[setorSelecionado] : [];
  const [itens, setItens] = useState<{ [chave: string]: number }>(
    () =>
      dadosIniciais?.itens
        ? { ...dadosIniciais.itens }
        : Object.fromEntries(
            Object.values(ITENS_POR_SETOR)
              .flat()
              .map((item) => [item.chave, 0])
          )
  );

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

  // Função para reordenar imagens via drag and drop ou setas
  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setPreviews(prev => {
      const arr = [...prev];
      const [removed] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, removed);
      return arr;
    });
    setFormulario(prev => {
      const arr = [...prev.imagens];
      const [removed] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, removed);
      return { ...prev, imagens: arr };
    });
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

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    try {
      if (formulario.imagens.length === 0 && !dadosIniciais?.imagens?.length) {
        throw new Error('Por favor, adicione pelo menos uma imagem');
      }
      const user = getAuth().currentUser;
      if (!user) throw new Error('Usuário não autenticado');
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
        itens: Object.fromEntries(
          (itensDisponiveis || []).map(item => [item.chave, itens[item.chave] || 0])
        ),
        ownerId: user.uid, // <-- ESSENCIAL PARA AS REGRAS DO FIRESTORE
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
      setItens(Object.fromEntries(
        Object.values(ITENS_POR_SETOR)
          .flat()
          .map((item) => [item.chave, 0])
      ));
      if (typeof onSuccess === 'function') onSuccess();
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao cadastrar imóvel.');
    } finally {
      setCarregando(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const inputClass =
    "w-full p-2 border border-gray-400 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition";
  const selectClass =
    "w-full p-2 border border-gray-400 rounded-lg bg-white text-black cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition";
  const buttonYellow =
    "flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg transition-colors font-semibold cursor-pointer";
  const buttonGreen =
    "flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors font-semibold cursor-pointer disabled:bg-gray-400";

  return (
    <form onSubmit={enviarFormulario} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          name="tipoNegocio"
          value={formulario.tipoNegocio}
          onChange={handleChange}
          className={selectClass}
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
            className={selectClass}
            required
          >
            <option value="">Tipo de negócio</option>
            <option value="Aluguel">Aluguel</option>
            <option value="Venda">Venda</option>
          </select>
        )}
      </div>

      {formulario.tipoNegocio && formulario.setorNegocio && (
        <select
          name="tipoImovel"
          value={formulario.tipoImovel}
          onChange={handleChange}
          className={selectClass}
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

      {/* Upload de imagens */}
      <UploadImages
        previews={previews}
        onDrop={handleDrop}
        onFileChange={handleFileChange}
        onRemove={removeImagem}
        onReorder={handleReorder}
        triggerFileInput={triggerFileInput}
        fileInputRef={fileInputRef}
        required={!dadosIniciais?.imagens?.length && formulario.imagens.length === 0}
        imagensExistentes={dadosIniciais?.imagens || []}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="valor"
          placeholder="Preço"
          value={formulario.valor}
          onChange={handleChange}
          className={inputClass}
          required
        />

        <input
          name="metragem"
          placeholder="Metragem (m²)"
          value={formulario.metragem}
          onChange={handleChange}
          className={inputClass}
          required
        />
      </div>

      <SelectCidadeBairro
        cidadesComBairros={cidadesComBairros}
        cidade={formulario.cidade}
        bairro={formulario.bairro}
        onChange={handleChange}
        selectClass={selectClass}
      />

      <input
        name="enderecoDetalhado"
        placeholder="Endereço (rua, número, complemento...)"
        value={formulario.enderecoDetalhado}
        onChange={handleChange}
        className={inputClass}
        required
      />

      <textarea
        name="descricao"
        placeholder="Descrição"
        value={formulario.descricao}
        onChange={handleChange}
        className={inputClass}
        rows={4}
        required
      />

      <input
        name="whatsapp"
        placeholder="WhatsApp (com DDD)"
        value={formulario.whatsapp}
        onChange={handleChange}
        className={inputClass}
        required
      />

      <select
        name="patrocinador"
        value={formulario.patrocinador}
        onChange={handleChange}
        className={selectClass}
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

      {/* Itens do imóvel */}
      {setorSelecionado && (
        <ItensImovel
          itensDisponiveis={itensDisponiveis}
          itens={itens}
          setItens={setItens}
          ITENS_QUANTITATIVOS={ITENS_QUANTITATIVOS}
        />
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <button
          type="button"
          onClick={() => router.push('/cadastrar-patrocinador')}
          className={buttonYellow}
        >
          Gerenciar Patrocinadores
        </button>

        <button
          type="submit"
          disabled={carregando}
          className={buttonGreen}
        >
          {carregando ? 'Salvando...' : 'Salvar Imóvel'}
        </button>
      </div>
    </form>
  );
}