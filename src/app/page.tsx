import Slider from "@/components/Slider";
import FiltrosExpansivos from "@/components/FiltrosExpansiveis";
import Patrocinios from "@/components/Patrocinios";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div
      className="
        flex flex-col items-center min-h-screen
        bg-gradient-to-b from-blue-100 to-white
      "
    >
      <Header />

      <section className="w-full pt-2 pb-8">
        <Slider />
      </section>

      <section className="flex justify-center w-full max-w-6xl">
        <FiltrosExpansivos />
      </section>
    
      <section className="w-full py-20">
        <h2 className="text-4xl md:text-3xl font-bold text-blue-800 text-center mb-8">
          Nossos Patrocinadores
        </h2>
        <Patrocinios />
      </section>

      <section className="w-full pt-8 pb-2">
        <Slider />
      </section>

      <Footer />
    </div>
  );
}