import Link from "next/link";
import Image from "next/image";

const patrocinadores = [
  { id: "l0oLEjljFrMFtFc4Gcjw", imagem: "/patrocinio.png" },
  { id: "", imagem: "/patrocinio.png" },
  { id: "", imagem: "/patrocinio.png" },
  { id: "", imagem: "/patrocinio.png" },
  { id: "", imagem: "/patrocinio.png" },
  { id: "", imagem: "/patrocinio.png" },
  { id: "", imagem: "/patrocinio.png" },
  { id: "", imagem: "/patrocinio.png" },
  { id: "", imagem: "/patrocinio.png" },
];

export default function Patrocinios() {
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-85 sm:max-w-140 mx-auto">
      {patrocinadores.map((patrocinador) => (
        <Link
          key={patrocinador.id}
          href={`/patrocinadores/${patrocinador.id}`}
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