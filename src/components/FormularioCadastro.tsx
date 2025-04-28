'use client';

import { useState } from 'react';

export default function FormularioCadastro() {
  const [form, setForm] = useState({
    titulo: '',
    tipo: '',
    cidade: '',
    preco: '',
    imagem: '',
  });

  const [mensagem, setMensagem] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/imoveis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        preco: Number(form.preco),
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setMensagem('✅ Imóvel cadastrado com sucesso!');
      setForm({ titulo: '', tipo: '', cidade: '', preco: '', imagem: '' });
    } else {
      setMensagem(`❌ Erro: ${data.message || 'Preencha todos os campos corretamente.'}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow space-y-4"
    >
      <h2 className="text-2xl font-bold">Cadastrar Imóvel</h2>

      <input
        type="text"
        name="titulo"
        placeholder="Título"
        value={form.titulo}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded"
        required
      />

      <select
        name="tipo"
        value={form.tipo}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded"
        required
      >
        <option value="">Selecione o tipo</option>
        <option value="comprar">Comprar</option>
        <option value="alugar">Alugar</option>
        <option value="rural">Rural</option>
      </select>

      <input
        type="text"
        name="cidade"
        placeholder="Cidade"
        value={form.cidade}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded"
        required
      />

      <input
        type="number"
        name="preco"
        placeholder="Preço"
        value={form.preco}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded"
        required
      />

      <input
        type="text"
        name="imagem"
        placeholder="URL da imagem"
        value={form.imagem}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded"
        required
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
      >
        Cadastrar
      </button>

      {mensagem && (
        <p className="text-center mt-2 text-sm font-semibold">{mensagem}</p>
      )}
    </form>
  );
}
