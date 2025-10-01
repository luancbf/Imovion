import Link from "next/link";
import Image from "next/image";

export default function TermosPage() {
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
              Termos de Uso
            </h1>
            <p className="text-gray-600 text-center mt-2">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Conteúdo dos Termos */}
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">1. Aceitação dos Termos</h2>
            <p className="mb-4 text-gray-700">
              Ao acessar e usar a plataforma Imovion, você concorda em cumprir e estar sujeito aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
            </p>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">2. Descrição do Serviço</h2>
            <p className="mb-4 text-gray-700">
              A Imovion é uma plataforma digital que conecta compradores, vendedores, locadores e locatários de imóveis. Oferecemos ferramentas para anunciar, buscar e gerenciar propriedades imobiliárias.
            </p>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">3. Registro e Conta do Usuário</h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Você deve fornecer informações precisas e atualizadas durante o registro</li>
              <li>É responsável por manter a confidencialidade de sua senha</li>
              <li>Deve notificar imediatamente sobre qualquer uso não autorizado de sua conta</li>
              <li>Apenas maiores de 18 anos podem criar contas na plataforma</li>
            </ul>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">4. Uso Aceitável</h2>
            <p className="mb-2 text-gray-700">Você concorda em NÃO:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Publicar informações falsas ou enganosas sobre imóveis</li>
              <li>Usar a plataforma para atividades ilegais ou fraudulentas</li>
              <li>Violar direitos de propriedade intelectual de terceiros</li>
              <li>Enviar spam ou conteúdo não solicitado</li>
              <li>Interferir no funcionamento normal da plataforma</li>
            </ul>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">5. Anúncios de Imóveis</h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Você é responsável pela veracidade das informações publicadas</li>
              <li>Deve possuir autorização legal para anunciar o imóvel</li>
              <li>Reservamo-nos o direito de remover anúncios inadequados</li>
              <li>Fotos e descrições devem representar fielmente o imóvel</li>
            </ul>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">6. Responsabilidades e Limitações</h2>
            <p className="mb-4 text-gray-700">
              A Imovion atua como intermediadora. Não somos responsáveis por:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Negociações entre usuários</li>
              <li>Veracidade das informações dos anúncios</li>
              <li>Problemas legais relacionados às transações</li>
              <li>Danos resultantes do uso da plataforma</li>
            </ul>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">7. Propriedade Intelectual</h2>
            <p className="mb-4 text-gray-700">
              Todos os direitos sobre o design, código, marca e conteúdo da plataforma pertencem à Imovion. É proibida a reprodução sem autorização expressa.
            </p>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">8. Modificações dos Termos</h2>
            <p className="mb-4 text-gray-700">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação na plataforma.
            </p>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">9. Encerramento</h2>
            <p className="mb-4 text-gray-700">
              Podemos suspender ou encerrar sua conta em caso de violação destes termos, sem aviso prévio.
            </p>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">10. Lei Aplicável</h2>
            <p className="mb-4 text-gray-700">
              Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida nos tribunais competentes do Brasil.
            </p>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">11. Contato</h2>
            <p className="mb-4 text-gray-700">
              Para dúvidas sobre estes termos, entre em contato:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>E-mail: contato@imovion.com.br</li>
              <li>Telefone: (11) 9999-9999</li>
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