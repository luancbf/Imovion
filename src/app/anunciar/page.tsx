import Link from "next/link";

export default function Anunciar() {
  return (
    <section className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Anuncie seu imóvel conosco!</h1>

      <p className="mb-10 text-lg text-gray-700">
        Escolha o plano ideal e entre em contato para anunciar seu imóvel.
      </p>

      <div className="grid md:grid-cols-2 gap-8">

        {/* Plano Grátis */}
        <div className="border p-6 rounded shadow hover:shadow-lg transition">
          <h2 className="text-2xl font-bold mb-4">Plano Grátis</h2>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>1 foto</li>
            <li>Descrição básica</li>
            <li>Duração de 30 dias</li>
          </ul>
          <span className="text-xl font-semibold">R$ 0,00</span>
        </div>

        {/* Plano Premium */}
        <div className="border p-6 rounded shadow hover:shadow-lg transition">
          <h2 className="text-2xl font-bold mb-4">Plano Premium</h2>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>Até 10 fotos</li>
            <li>Descrição completa</li>
            <li>Destaque na página inicial</li>
            <li>Duração de 60 dias</li>
          </ul>
          <span className="text-xl font-semibold">R$ 99,90</span>
        </div>

      </div>

      <div className="text-center mt-12">
        <Link href="https://wa.me/5599999999999" target="_blank">
          <button className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition text-lg">
            Falar com a equipe
          </button>
        </Link>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        *Todos os anúncios passam por aprovação antes da publicação.
      </p>
    </section>
  );
}
