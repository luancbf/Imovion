import Link from "next/link";
import { FiCheckCircle } from "react-icons/fi";

export default function EmailConfirmadoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-200">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="text-green-600" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            E-mail Confirmado!
          </h1>
          <p className="text-gray-600">
            Sua conta foi ativada com sucesso. Agora você pode fazer login e começar a usar todos os recursos da Imovion.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link 
            href="/login"
            className="block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Fazer Login
          </Link>
          <Link 
            href="/"
            className="block bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}