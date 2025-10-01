import Link from "next/link";
import Image from "next/image";

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-80 h-20 mb-4">
              <Image
                src="/imovion.webp"
                alt="Imovion Logo"
                fill
                className="object-contain"
                priority
                sizes="320px"
              />
            </div>
            <h1 className="text-3xl font-bold text-blue-700 text-center">
              Política de Privacidade
            </h1>
            <p className="text-gray-600 text-center mt-2">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Conteúdo da Política */}
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">1. Introdução</h2>
            <p className="mb-4 text-gray-700">
              A Imovion respeita sua privacidade e está comprometida em proteger seus dados pessoais. Esta política explica como coletamos, usamos e protegemos suas informações.
            </p>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">2. Informações que Coletamos</h2>
            <h3 className="text-lg font-medium text-blue-600 mb-2">2.1 Dados Pessoais</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Nome completo</li>
              <li>E-mail</li>
              <li>Telefone</li>
              <li>CRECI (para corretores)</li>
              <li>Dados de autenticação (senha criptografada)</li>
            </ul>

            <h3 className="text-lg font-medium text-blue-600 mb-2">2.2 Dados de Uso</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Endereço IP</li>
              <li>Informações do navegador</li>
              <li>Páginas visitadas</li>
              <li>Tempo de permanência</li>
              <li>Preferências de busca</li>
            </ul>

            <h3 className="text-lg font-medium text-blue-600 mb-2">2.3 Cookies</h3>
            <p className="mb-4 text-gray-700">
              Utilizamos cookies para melhorar sua experiência, personalizar conteúdo e analisar o tráfego do site.
            </p>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">3. Como Usamos suas Informações</h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Criar e gerenciar sua conta</li>
              <li>Processar e exibir anúncios de imóveis</li>
              <li>Facilitar comunicação entre usuários</li>
              <li>Enviar notificações importantes</li>
              <li>Melhorar nossos serviços</li>
              <li>Prevenir fraudes e garantir segurança</li>
              <li>Cumprir obrigações legais</li>
            </ul>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">4. Compartilhamento de Dados</h2>
            <p className="mb-2 text-gray-700">Podemos compartilhar suas informações apenas:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Com seu consentimento explícito</li>
              <li>Para cumprir obrigações legais</li>
              <li>Com prestadores de serviços (hospedagem, analytics)</li>
              <li>Em caso de fusão ou aquisição da empresa</li>
            </ul>
            <p className="mb-4 text-gray-700">
              <strong>Nunca vendemos seus dados pessoais para terceiros.</strong>
            </p>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">5. Segurança dos Dados</h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Criptografia SSL/TLS para transmissão de dados</li>
              <li>Senhas protegidas com hash seguro</li>
              <li>Acesso restrito aos dados pessoais</li>
              <li>Monitoramento de segurança 24/7</li>
              <li>Backups regulares e seguros</li>
            </ul>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">6. Seus Direitos (LGPD)</h2>
            <p className="mb-2 text-gray-700">Conforme a Lei Geral de Proteção de Dados, você tem direito a:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou incorretos</li>
              <li>Solicitar exclusão de seus dados</li>
              <li>Revogar consentimento</li>
              <li>Portabilidade dos dados</li>
              <li>Informações sobre uso e compartilhamento</li>
            </ul>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">7. Retenção de Dados</h2>
            <p className="mb-4 text-gray-700">
              Mantemos seus dados apenas pelo tempo necessário para:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Fornecer nossos serviços</li>
              <li>Cumprir obrigações legais</li>
              <li>Resolver disputas</li>
              <li>Prevenir fraudes</li>
            </ul>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">8. Cookies e Tecnologias Similares</h2>
            <p className="mb-2 text-gray-700">Utilizamos diferentes tipos de cookies:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li><strong>Essenciais:</strong> Necessários para funcionamento básico</li>
              <li><strong>Funcionais:</strong> Melhoram a experiência do usuário</li>
              <li><strong>Analíticos:</strong> Coletam dados sobre uso do site</li>
              <li><strong>Publicidade:</strong> Personalizam anúncios (com seu consentimento)</li>
            </ul>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">9. Transferência Internacional</h2>
            <p className="mb-4 text-gray-700">
              Alguns de nossos prestadores de serviço podem estar localizados fora do Brasil. Garantimos que essas transferências atendem aos padrões de proteção da LGPD.
            </p>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">10. Menores de Idade</h2>
            <p className="mb-4 text-gray-700">
              Nossos serviços são destinados apenas a maiores de 18 anos. Não coletamos intencionalmente dados de menores de idade.
            </p>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">11. Alterações nesta Política</h2>
            <p className="mb-4 text-gray-700">
              Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas por e-mail ou na plataforma.
            </p>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">12. Contato</h2>
            <p className="mb-2 text-gray-700">
              Para exercer seus direitos ou esclarecer dúvidas sobre privacidade:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li><strong>E-mail:</strong> privacidade@imovion.com.br</li>
              <li><strong>Telefone:</strong> (11) 9999-9999</li>
              <li><strong>Endereço:</strong> [Endereço da empresa]</li>
              <li><strong>DPO:</strong> dpo@imovion.com.br</li>
            </ul>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-4 justify-center mt-8 pt-6 border-t border-gray-200">
            <Link 
              href="/cadastro" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Voltar ao Cadastro
            </Link>
            <Link 
              href="/" 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              Página Inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}