'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { FiMessageSquare } from "react-icons/fi";
import { supabase } from "@/lib/supabase";

export default function Anunciar() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user && user.email ? { email: user.email } : null);
      setLoading(false);
    };

    checkUser();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      {/* Main Section */}
      <section className="flex-1 flex flex-col justify-center items-center py-16 px-4">
        <div className="w-full max-w-4xl mx-auto">
          
          {/* Título Principal */}
          <div className="text-center mb-10">
            <h1 className="font-poppins text-4xl md:text-5xl font-bold text-blue-700 mb-6">
              Anuncie seu Imóvel
            </h1>
            <p className="text-lg text-gray-600">
              Conecte-se diretamente com interessados
            </p>
          </div>

          {!loading && (
            <div className="max-w-3xl mx-auto">
              

              {/* Planos Simplificados */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {/* Individual */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-bold text-blue-700 mb-3">Proprietário</h3>
                  <div className="text-3xl font-bold text-green-600 mb-2">R$ 39,90</div>
                  <p className="text-sm text-gray-500 mb-4">por imóvel</p>
                  
                  <div className="text-left mb-6 space-y-2">
                    <p className="text-sm text-gray-600">✓ Anúncio ativo por 60 dias</p>
                    <p className="text-sm text-gray-600">✓ Contato direto no WhatsApp</p>
                    <p className="text-sm text-gray-600">✓ Até 10 fotos</p>
                    <p className="text-sm text-gray-600">✓ Alto índice de visibilidade</p>
                  </div>
                  
                  <Link href={user ? "/painel-usuario/cadastrar-imovel" : "/cadastro"}>
                    <button className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors cursor-pointer">
                      {user ? "Cadastrar Imóvel" : "Começar"}
                    </button>
                  </Link>
                </div>

                {/* Profissional */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg text-white text-center hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-bold mb-3">Corretores/Imobiliárias e proprietários 5+ Imóveis</h3>
                  <div className="text-3xl font-bold mb-2">Sob Consulta</div>
                  <p className="text-sm text-white mb-4">Entre em contato com nossa equipe e receba um plano exclusivo para você.</p>
                  
                  <div className="text-left mb-8 space-y-2">
                    <p className="text-sm text-white">✓ Painel profissional</p>
                    <p className="text-sm text-white">✓ Suporte prioritário</p>
                  </div>
                  
                  <Link href="https://wa.me/65999772500?text=Olá! Interesse no plano profissional Imovion." target="_blank">
                    <button className="w-full bg-white text-blue-600 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                      <FiMessageSquare size={18} />
                      WhatsApp
                    </button>
                  </Link>
                </div>
              </div>

              {/* Direcionamento para Login */}
              {!user && (
                <div className="text-center mb-12">
                  <Link href="/login">
                    <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors text-lg cursor-pointer">
                      Fazer Login
                    </button>
                  </Link>
                  <p className="text-gray-600 mt-4">Acesse seu painel para gerenciar anúncios</p>
                </div>
              )}

              {/* FAQ Rápido */}
              <div className="max-w-2xl mx-auto">
                <h2 className="text-xl font-bold text-blue-700 text-center mb-6">Dúvidas Frequentes</h2>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-blue-700 mb-2">Como funciona o pagamento?</h3>
                    <p className="text-sm text-gray-600">Pagamento via PIX, cartão ou transferência. Anúncio ativa imediatamente após confirmação.</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-blue-700 mb-2">Posso cancelar antes dos 60 dias?</h3>
                    <p className="text-sm text-gray-600">Sim, você pode desativar seu anúncio a qualquer momento no painel de usuário.</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-blue-700 mb-2">Quantos interessados vou receber?</h3>
                    <p className="text-sm text-gray-600">Varia conforme localização e tipo do imóvel. Você recebe todos os contatos diretamente.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
}