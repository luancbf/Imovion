import dynamic from 'next/dynamic';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

// Dynamic imports para code splitting
const Slider = dynamic(() => import("@/components/home/Slider"), {
  loading: () => <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg"></div>
});

const FiltrosExpansivos = dynamic(() => import("@/components/home/FiltrosExpansiveis"), {
  loading: () => <div className="w-full h-32 bg-gray-100 animate-pulse rounded-lg mx-4"></div>
});

const MensagemCliente = dynamic(() => import("@/components/home/MensagemCliente"), {
  loading: () => <div className="w-full h-24 bg-gray-100 animate-pulse rounded-lg"></div>
});

const Patrocinios = dynamic(() => import("@/components/home/Patrocinios"), {
  loading: () => <div className="w-full h-48 bg-gray-100 animate-pulse rounded-lg"></div>
});

const Footer = dynamic(() => import("@/components/home/Footer"), {
  loading: () => <div className="w-full h-32 bg-gray-800 animate-pulse"></div>
});

const Header = dynamic(() => import("@/components/home/Header"), {
  loading: () => <div className="w-full h-16 bg-white shadow animate-pulse"></div>
});

const CookieConsent = dynamic(() => import("@/components/CookieConsent"), {
  loading: () => null
});

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen">
      <Header />
      
      <section className="w-full pb-8">
        <Slider 
          type="principal"
          autoplay={true}
          showControls={true}
        />
      </section>
      
      <div className='text-center px-4 mb-8'>
        <h1 className='font-poppins text-2xl md:text-3xl font-bold text-blue-900 mb-2'>
          Encontre seu imóvel ideal
        </h1>
        <div className='flex items-center justify-center gap-2 text-blue-600'>
          <span className='text-sm font-medium'>Clique para filtrar</span>
          <div className='animate-bounce'>
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clipRule='evenodd' />
            </svg>
          </div>
        </div>
      </div>
      
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