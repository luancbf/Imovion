'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const APIConfigForm = dynamic(() => import('@/components/admin/ApiConfigForm'), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      <span className="ml-3 text-gray-600">Carregando formulário...</span>
    </div>
  )
});

export default function EditAPIConfigPage() {
  const router = useRouter();
  const params = useParams();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async (id: string) => {
      try {
        const response = await fetch(`/api/admin/api-configs/${id}`);
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        } else {
          throw new Error('Configuração não encontrada');
        }
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
        alert('Erro ao carregar configuração');
        router.push('/admin/api-integration');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadConfig(params.id as string);
    }
  }, [params.id, router]);

  const handleSuccess = () => {
    router.push('/admin/api-integration');
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Carregando configuração...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Configuração de API</h1>
        <p className="text-gray-600 mt-2">Modifique a configuração da integração de API</p>
      </div>
      
      <APIConfigForm 
        config={config}
        onSuccess={handleSuccess}
        onCancel={() => router.push('/admin/api-integration')}
      />
    </>
  );
}