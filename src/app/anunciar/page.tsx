import Link from "next/link";

export default function Anunciar() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4">
          Anuncie seu imóvel conosco!
        </h1>
        <p className="text-lg md:text-xl text-gray-700">
          Escolha o plano ideal e alcance milhares de pessoas.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
        {/* Plano Premium */}
        <div className="flex-1 bg-white border-2 border-yellow-300 rounded-2xl shadow-md hover:shadow-xl transition p-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-3 text-yellow-700">Plano Premium</h2>
          <ul className="list-disc list-inside text-gray-600 mb-6 text-base space-y-1">
            <li>Até 10 fotos</li>
            <li>Descrição completa</li>
            <li>Destaque na página inicial</li>
            <li>Duração de 60 dias</li>
          </ul>
          <span className="text-2xl font-bold text-yellow-700 mb-4">R$ 99,90</span>
          <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            Mais visibilidade
          </span>
        </div>
      </div>

      <div className="text-center mt-12">
        <Link href="https://wa.me/5599999999999" target="_blank">
          <button className="bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow cursor-pointer hover:scale-105 hover:brightness-110 transition-all duration-200">
            Falar com a equipe no WhatsApp
          </button>
        </Link>
        <p className="text-xs text-gray-500 text-center mt-4">
          *Todos os anúncios passam por aprovação antes da publicação.
        </p>
      </div>
    </section>
  );
}