import Slider from "@/components/home/Slider";
import FiltrosExpansivos from "@/components/home/FiltrosExpansiveis";
import Patrocinios from "@/components/home/Patrocinios";
import Footer from "@/components/home/Footer";
import Header from "@/components/home/Header";


export default function Home() {
  return (
    <div
      className="
        flex flex-col items-center min-h-screen
      "
    >
      <Header />

      <section className="w-full pt-5 pb-15">
        <Slider />
      </section>

      <section className="flex justify-center w-full">
        <FiltrosExpansivos />
      </section>
    
      <section className="w-full pt-15">
        <Patrocinios />
      </section>

      <section className="w-full pt-8 pb-2">
        <Slider />
      </section>

      <Footer />
    </div>
  );
}