import Slider from "@/components/home/Slider";
import FiltrosExpansivos from "@/components/home/FiltrosExpansiveis";
import MensagemCliente from "@/components/home/MensagemCliente";
import Patrocinios from "@/components/home/Patrocinios";
import Footer from "@/components/home/Footer";
import Header from "@/components/home/Header";
import CookieConsent from "@/components/CookieConsent";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next"

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen">
      <Header />
      
      <section className="w-full pb-10">
        <Slider 
          type="principal"
          autoplay={true}
          showControls={true}
        />
      </section>
      
      <FiltrosExpansivos />
      
      <MensagemCliente />

      <section className="w-full pt-10">
        <Patrocinios />
      </section>

      <section className="w-full pt-8">
        <Slider 
          type="secundario"
          autoplay={true}
          showControls={true}
        />
      </section>
      <Analytics/>
      <SpeedInsights />
      <CookieConsent />
      <Footer />
    </div>
  );
}