import Link from "next/link";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

export default function Anunciar() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-blue-200 to-white">
      <Header />
      <section className="flex-1 flex flex-col justify-center items-center py-10 px-2">
        <div className="w-full max-w-11/12 md:max-w-xl mx-auto">
          <div className="text-center mb-12">
            <h1
              className="font-poppins text-4xl md:text-5xl font-extrabold text-blue-700 mb-4 drop-shadow"
              style={{ userSelect: "none" }}
            >
              Anuncie seu imóvel conosco!
            </h1>
            <p
              className="font-inter text-lg md:text-xl text-blue-900"
              style={{ userSelect: "none" }}
            >
              Escolha o plano ideal e alcance milhares de pessoas.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-stretch">
            
            {/* Plano*/}
            <div className="flex-1 bg-white border-2 border-blue-200 rounded-2xl shadow-lg hover:shadow-2xl transition p-8 flex flex-col items-center">
              <h2 className="font-poppins text-2xl font-bold mb-3 text-blue-700">Plano Premium</h2>
              <ul className="font-inter list-disc list-inside text-blue-900 mb-6 text-base space-y-1">
                <li>Até 10 fotos</li>
                <li>Descrição completa</li>
                <li>
                  <span className="font-semibold text-blue-700">Destaque na página inicial</span>
                </li>
                <li>Duração de 60 dias</li>
              </ul>
              <span className="font-poppins text-3xl font-extrabold text-blue-700 mb-4 drop-shadow">
                R$ 99,90
              </span>
              <span className="font-poppins inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-semibold mb-2">
                Mais visibilidade
              </span>
            </div>
          </div>

          <div className="font-poppins text-center mt-14 flex flex-col items-center">
            <Link href="https://wa.me/5599999999999" target="_blank">
              <button className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg cursor-pointer hover:scale-105 hover:brightness-110 transition-all duration-200">
                Falar com a equipe no WhatsApp
              </button>
            </Link>
            <p
              className="font-inter text-xs text-gray-500 text-center mt-4 select-none"
              style={{ userSelect: "none" }}
            >
              *Todos os anúncios passam por aprovação antes da publicação.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}