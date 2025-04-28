'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function CadastrarImovel() {
  const [formulario, setFormulario] = useState({
    titulo: '',
    endereco: '',
    valor: '',
    metragem: '',
    descricao: '',
    tipoImovel: '',
    tipoNegocio: '',
    whatsapp: '',
    mensagemWhatsapp: '',
    imagens: [''],
    patrocinador: '',
  });

  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const adicionarImagem = () => {
    setFormulario({
      ...formulario,
      imagens: [...formulario.imagens, ''],
    });
  };

  const alterarImagem = (index: number, valor: string) => {
    const novasImagens = [...formulario.imagens];
    novasImagens[index] = valor;
    setFormulario({ ...formulario, imagens: novasImagens });
  };

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    try {
      await addDoc(collection(db, 'imoveis'), {
        ...formulario,
        valor: Number(formulario.valor),
        metragem: Number(formulario.metragem),
        dataCadastro: new Date(),
      });

      alert('Imóvel cadastrado com sucesso!');
      router.push('/imoveis');
    } catch (error) {
      console.error('Erro ao cadastrar imóvel:', error);
      alert('Erro ao cadastrar imóvel. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Cadastrar Imóvel</h1>

      <form onSubmit={enviarFormulario} className="space-y-6">

        {/* Título */}
        <input
          type="text"
          name="titulo"
          placeholder="Título do imóvel"
          value={formulario.titulo}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        {/* Endereço */}
        <input
          type="text"
          name="endereco"
          placeholder="Endereço"
          value={formulario.endereco}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        {/* Valor */}
        <input
          type="number"
          name="valor"
          placeholder="Valor (ex: 350000)"
          value={formulario.valor}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        {/* Metragem */}
        <input
          type="number"
          name="metragem"
          placeholder="Área (m²)"
          value={formulario.metragem}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        {/* Tipo de Imóvel */}
        <select
          name="tipoImovel"
          value={formulario.tipoImovel}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Selecione o tipo de imóvel</option>
          <option value="Casa">Casa</option>
          <option value="Apartamento">Apartamento</option>
          <option value="Chácara">Chácara</option>
          <option value="Terreno">Terreno</option>
        </select>

        {/* Tipo de Negócio */}
        <select
          name="tipoNegocio"
          value={formulario.tipoNegocio}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Selecione o tipo de negócio</option>
          <option value="Comprar">Comprar</option>
          <option value="Alugar">Alugar</option>
          <option value="Rural">Rural</option>
        </select>

        {/* Descrição */}
        <textarea
          name="descricao"
          placeholder="Descrição do imóvel"
          value={formulario.descricao}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows={4}
          required
        />

        {/* Whatsapp */}
        <input
          type="text"
          name="whatsapp"
          placeholder="Whatsapp (somente números com DDD)"
          value={formulario.whatsapp}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        {/* Mensagem Whatsapp */}
        <input
          type="text"
          name="mensagemWhatsapp"
          placeholder="Mensagem padrão para Whatsapp"
          value={formulario.mensagemWhatsapp}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        {/* Imagens */}
        <div className="space-y-2">
          {formulario.imagens.map((img, index) => (
            <input
              key={index}
              type="text"
              placeholder={`URL da imagem ${index + 1}`}
              value={img}
              onChange={(e) => alterarImagem(index, e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          ))}
          <button
            type="button"
            onClick={adicionarImagem}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Adicionar mais imagem
          </button>
        </div>

        {/* Patrocinador (opcional) */}
        <input
          type="text"
          name="patrocinador"
          placeholder="Nome do patrocinador (opcional)"
          value={formulario.patrocinador}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        {/* Botão de Enviar */}
        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
        >
          {carregando ? 'Cadastrando...' : 'Cadastrar Imóvel'}
        </button>
      </form>
    </div>
  );
}
