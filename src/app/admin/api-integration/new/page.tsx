'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ApiConfigForm from '@/components/admin/ApiConfigForm';

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