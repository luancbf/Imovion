import Link from "next/link";
import Image from "next/image";

const patrocinadores = [
  { id: "patrocinador1", imagem: "/patrocinio.png" },
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
    <div className="grid grid-cols-3 gap-6 mt-20 w-full max-w-3xl mx-auto">
      {patrocinadores.map((patrocinador) => (
        <Link
          key={patrocinador.id}
          href={`/patrocinadores/${patrocinador.id}`}
          className="hover:blur-[3px] transition-all duration-300"
        >
          <Image
            src={patrocinador.imagem}
            alt={`Patrocinador ${patrocinador.id}`}
            width={300}
            height={180}
            className="w-full object-cover rounded-lg shadow-md"
            priority
          />
        </Link>
      ))}
    </div>
  );
}