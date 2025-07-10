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