import Link from "next/link";
import Image from "next/image";

const patrocinadores = [
  { id: "thiago-kaiser", imagem: "/patrocinio.png" },
  { id: "patrocinador2", imagem: "/patrocinio.png" },
  { id: "patrocinador3", imagem: "/patrocinio.png" },
  { id: "patrocinador4", imagem: "/patrocinio.png" },
  { id: "patrocinador5", imagem: "/patrocinio.png" },
  { id: "patrocinador6", imagem: "/patrocinio.png" },
  { id: "patrocinador7", imagem: "/patrocinio.png" },
  { id: "patrocinador8", imagem: "/patrocinio.png" },
  { id: "patrocinador9", imagem: "/patrocinio.png" },
];

export default function Patrocinios() {
  return (
    <div className="grid grid-cols-3 gap-6 w-full max-w-3xl mx-auto">
      {patrocinadores.map((patrocinador) => (
        <Link
          key={patrocinador.id}
          href={`/patrocinadores/${patrocinador.id}`}
          className="hover:blur-[3px] transition-all duration-300"
          aria-label={`Ver detalhes do ${patrocinador.id}`}
          title={`Ver detalhes do ${patrocinador.id}`}
        >
          <Image
            src={patrocinador.imagem}
            alt={`Logo do ${patrocinador.id}`}
            width={300}
            height={180}
            className="w-full object-cover rounded-lg shadow-md"
          />
        </Link>
      ))}
    </div>
  );
}