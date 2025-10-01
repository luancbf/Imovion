"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const APIConfigManager = dynamic(() => import('@/components/admin/ApiConfigManager'), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      <span className="ml-3 text-gray-600">Carregando configurações...</span>
    </div>
  )
});

export default function APIIntegrationPage() {
  return <APIConfigManager />;
}