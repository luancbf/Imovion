'use client';

import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';

const tiposImovel: { [key: string]: string[] } = {
  Comprar: ['Apartamento', 'Casa', 'Terreno', 'Sobrado'],
  Alugar: ['Apartamento', 'Casa', 'Sala Comercial'],
  Rural: ['Chácara', 'Sítio', 'Fazenda'],
};

export default function CadastroImovelPage() {
  const [tipoNegocio, setTipoNegocio] = useState('Comprar');
  const [tipoImovel, setTipoImovel] = useState('');
  const [endereco, setEndereco] = useState('');
  const [valor, setValor] = useState('');
  const [metragem, setMetragem] = useState('');
  const [descricao, setDescricao] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [mensagemWhatsapp, setMensagemWhatsapp] = useState('');
  const [imagens, setImagens] = useState<string[]>([]);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tipoImovel) {
      alert('Selecione um tipo de imóvel.');
      return;
    }

    try {
      await addDoc(collection(db, 'imoveis'), {
        tipoNegocio,
        tipoImovel,
        endereco,
        valor: Number(valor),
        metragem: Number(metragem),
        descricao,
        whatsapp,
        mensagemWhatsapp,
        imagens,
      });

      alert('Imóvel cadastrado com sucesso!');
      
      // Limpa o formulário
      setTipoNegocio('Comprar');
      setTipoImovel('');
      setEndereco('');
      setValor('');
      setMetragem('');
      setDescricao('');
      setWhatsapp('');
      setMensagemWhatsapp('');
      setImagens([]);
    } catch (error) {
      console.error('Erro ao cadastrar imóvel:', error);
      alert('Erro ao cadastrar imóvel. Tente novamente.');
    }
  };

  const handleTipoNegocioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novoTipoNegocio = e.target.value;
    setTipoNegocio(novoTipoNegocio);
    setTipoImovel(''); // Limpa o tipoImovel para forçar o usuário a escolher de novo
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Cadastrar Imóvel</h1>

      <form onSubmit={handleCadastro} className="space-y-6">

        {/* Tipo de Negócio */}
        <div>
          <label className="block mb-1 font-semibold">Tipo de Negócio</label>
          <select
            value={tipoNegocio}
            onChange={handleTipoNegocioChange}
            className="w-full p-2 border rounded"
          >
            <option value="Comprar">Comprar</option>
            <option value="Alugar">Alugar</option>
            <option value="Rural">Rural</option>
          </select>
        </div>

        {/* Tipo de Imóvel */}
        <div>
          <label className="block mb-1 font-semibold">Tipo de Imóvel</label>
          <select
            value={tipoImovel}
            onChange={(e) => setTipoImovel(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Selecione</option>
            {tiposImovel[tipoNegocio]?.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        {/* Endereço */}
        <div>
          <label className="block mb-1 font-semibold">Endereço</label>
          <input
            type="text"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Valor */}
        <div>
          <label className="block mb-1 font-semibold">Valor (R$)</label>
          <input
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Metragem */}
        <div>
          <label className="block mb-1 font-semibold">Metragem (m²)</label>
          <input
            type="number"
            value={metragem}
            onChange={(e) => setMetragem(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block mb-1 font-semibold">Descrição</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full p-2 border rounded"
            rows={5}
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block mb-1 font-semibold">WhatsApp (somente números)</label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Mensagem WhatsApp */}
        <div>
          <label className="block mb-1 font-semibold">Mensagem para WhatsApp</label>
          <input
            type="text"
            value={mensagemWhatsapp}
            onChange={(e) => setMensagemWhatsapp(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Imagens */}
        <div>
          <label className="block mb-1 font-semibold">Imagens (URLs separadas por vírgula)</label>
          <input
            type="text"
            value={imagens.join(',')}
            onChange={(e) => setImagens(e.target.value.split(','))}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Botão */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded"
        >
          Cadastrar Imóvel
        </button>
      </form>
    </div>
  );
}
