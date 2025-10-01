"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const ApiConfigForm = dynamic(() => import('@/components/admin/ApiConfigForm'), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      <span className="ml-3 text-gray-600">Carregando formulário...</span>
    </div>
  )
});

export default function NewAPIConfigPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/admin/api-integration');
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nova Configuração de API</h1>
        <p className="text-gray-600 mt-2">Configure uma nova integração com API de imobiliária</p>
      </div>
      
      <ApiConfigForm 
        onSuccess={handleSuccess}
        onCancel={() => router.push('/admin/api-integration')}
      />
    </>
  );
}