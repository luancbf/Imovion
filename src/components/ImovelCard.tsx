import Link from "next/link";
import Image from "next/image";

interface Imovel {
  id: string;
  cidade: string;
  bairro: string;
  enderecoDetalhado: string;
  valor: number;
  metragem: number;
  descricao: string;
  tipoImovel: string;
  tipoNegocio: string;
  setorNegocio?: string;
  whatsapp: string;
  patrocinador?: string;
  imagens: string[];
}

export default function ImovelCard({ imovel }: { imovel: Imovel }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <Link href={`/imoveis/${imovel.id}`} className="block hover:opacity-90 transition">
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          {imovel.imagens && imovel.imagens.length > 0 ? (
            <Image
              src={imovel.imagens[0]}
              alt={`Imagem do imóvel em ${imovel.cidade}`}
              width={400}
              height={192}
              className="w-full h-full object-cover"
              unoptimized
              priority
            />
          ) : (
            <span className="text-gray-400">Sem imagem</span>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <h2 className="text-xl font-bold mb-1">{imovel.tipoImovel}</h2>
        <p className="text-gray-700 font-semibold mb-2">
          {imovel.bairro}, {imovel.cidade}
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Endereço:</span> {imovel.enderecoDetalhado}
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Área:</span> {imovel.metragem} m²
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Valor:</span>{" "}
          <span className="font-bold">
            {imovel.valor.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </p>
        <p className="text-gray-600 mb-2">
          <span className="font-medium">Descrição:</span> {imovel.descricao}
        </p>
        <div className="mt-auto flex justify-center gap-2">
          <Link
            href={`/imoveis/${imovel.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
          >
            Ver detalhes
          </Link>
          <a
            href={`https://wa.me/${imovel.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
          >
            Entrar em contato
          </a>
        </div>
      </div>
    </div>
  );
}