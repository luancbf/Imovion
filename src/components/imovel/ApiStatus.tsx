// src/components/imovel/ApiStatus.tsx
interface ApiStatusProps {
  fonte_api?: string;
  api_source_name?: string;
  data_sincronizacao?: Date | string;
  status_sync?: 'active' | 'inactive' | 'error';
}

export default function ApiStatus({
  fonte_api,
  api_source_name,
  data_sincronizacao,
  status_sync = 'active'
}: ApiStatusProps) {
  if (!fonte_api || fonte_api === 'internal') return null;

  const getStatusColor = () => {
    switch (status_sync) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusIcon = () => {
    switch (status_sync) {
      case 'active': return '✅';
      case 'error': return '❌';
      case 'inactive': return '⏸️';
      default: return '🔄';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor()}`}>
      <span>{getStatusIcon()}</span>
      <span className="font-medium">
        {api_source_name || 'API Externa'}
      </span>
      {data_sincronizacao && (
        <span className="text-xs opacity-75">
          ({new Date(data_sincronizacao).toLocaleDateString('pt-BR')})
        </span>
      )}
    </div>
  );
}