import Slider from "@/components/Slider";
import FiltrosExpansivos from "@/components/FiltrosExpansiveis";
import Patrocinios from "@/components/Patrocinios";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="
              flex flex-col items-center min-h-screen
              bg-gray-300
                ">
                
                <Header/>

                <Slider/>
    
                <FiltrosExpansivos/>
    
                <Patrocinios/>
    
                <Slider/>
    
                <Footer/>
            </div>
  );
}
