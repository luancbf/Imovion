'use client';

import { db, storage } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

const tiposImovel: { [key: string]: string[] } = {
  Comprar: ['Apartamento', 'Casa', 'Terreno', 'Sobrado'],
  Alugar: ['Apartamento', 'Casa', 'Sala Comercial'],
  Rural: ['Chácara', 'Sítio', 'Fazenda'],
};

const schema = z.object({
  tipoNegocio: z.enum(['Comprar', 'Alugar', 'Rural']),
  tipoImovel: z.string().min(1, 'Selecione o tipo de imóvel.'),
  endereco: z.string().min(1, 'Endereço é obrigatório.'),
  valor: z.coerce.number().min(0, 'Valor inválido.'),
  metragem: z.coerce.number().min(1, 'Metragem inválida.'),
  descricao: z.string().min(10, 'Descrição precisa ter pelo menos 10 caracteres.'),
  whatsapp: z.string().min(10, 'Número de WhatsApp inválido.'),
  mensagemWhatsapp: z.string().min(1, 'Mensagem para WhatsApp é obrigatória.'),
  imagens: z.any(),
});

type FormData = z.infer<typeof schema>;

export default function CadastroImovelPage() {
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipoNegocio: 'Comprar',
    },
  });

  const tipoNegocio = watch('tipoNegocio');

  const onSubmit = async (data: FormData) => {
    try {
      setUploading(true);

      const files = (data.imagens as FileList) || [];
      const uploadPromises = Array.from(files).map(async (file) => {
        const storageRef = ref(storage, `imoveis/${file.name}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      });

      const imagensUrls = await Promise.all(uploadPromises);

      await addDoc(collection(db, 'imoveis'), {
        ...data,
        valor: Number(data.valor),
        metragem: Number(data.metragem),
        imagens: imagensUrls,
      });

      alert('Imóvel cadastrado com sucesso!');
      reset();
    } catch (error) {
      console.error('Erro ao cadastrar imóvel:', error);
      alert('Erro ao cadastrar imóvel. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Cadastrar Imóvel</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Tipo de Negócio */}
        <div>
          <label className="block mb-1 font-semibold">Tipo de Negócio</label>
          <select {...register('tipoNegocio')} className="w-full p-2 border rounded">
            <option value="Comprar">Comprar</option>
            <option value="Alugar">Alugar</option>
            <option value="Rural">Rural</option>
          </select>
        </div>

        {/* Tipo de Imóvel */}
        <div>
          <label className="block mb-1 font-semibold">Tipo de Imóvel</label>
          <select {...register('tipoImovel')} className="w-full p-2 border rounded">
            <option value="">Selecione</option>
            {tiposImovel[tipoNegocio]?.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
          {errors.tipoImovel && <p className="text-red-500">{errors.tipoImovel.message}</p>}
        </div>

        {/* Endereço */}
        <div>
          <label className="block mb-1 font-semibold">Endereço</label>
          <input type="text" {...register('endereco')} className="w-full p-2 border rounded" />
          {errors.endereco && <p className="text-red-500">{errors.endereco.message}</p>}
        </div>

        {/* Valor */}
        <div>
          <label className="block mb-1 font-semibold">Valor (R$)</label>
          <input type="number" {...register('valor')} className="w-full p-2 border rounded" />
          {errors.valor && <p className="text-red-500">{errors.valor.message}</p>}
        </div>

        {/* Metragem */}
        <div>
          <label className="block mb-1 font-semibold">Metragem (m²)</label>
          <input type="number" {...register('metragem')} className="w-full p-2 border rounded" />
          {errors.metragem && <p className="text-red-500">{errors.metragem.message}</p>}
        </div>

        {/* Descrição */}
        <div>
          <label className="block mb-1 font-semibold">Descrição</label>
          <textarea {...register('descricao')} className="w-full p-2 border rounded" rows={5} />
          {errors.descricao && <p className="text-red-500">{errors.descricao.message}</p>}
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block mb-1 font-semibold">WhatsApp (somente números)</label>
          <input type="text" {...register('whatsapp')} className="w-full p-2 border rounded" />
          {errors.whatsapp && <p className="text-red-500">{errors.whatsapp.message}</p>}
        </div>

        {/* Mensagem WhatsApp */}
        <div>
          <label className="block mb-1 font-semibold">Mensagem para WhatsApp</label>
          <input type="text" {...register('mensagemWhatsapp')} className="w-full p-2 border rounded" />
          {errors.mensagemWhatsapp && <p className="text-red-500">{errors.mensagemWhatsapp.message}</p>}
        </div>

        {/* Upload de Imagens */}
        <div>
          <label className="block mb-1 font-semibold">Imagens (pode selecionar várias)</label>
          <input
            type="file"
            multiple
            {...register('imagens')}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Botão */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded"
        >
          {uploading ? 'Cadastrando...' : 'Cadastrar Imóvel'}
        </button>
      </form>
    </div>
  );
}
