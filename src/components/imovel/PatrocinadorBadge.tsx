'use client';

import Link from 'next/link';

interface PatrocinadorBadgeProps {
  patrocinador: string;
  nome: string;
}

const PatrocinadorBadge: React.FC<PatrocinadorBadgeProps> = ({ patrocinador, nome }) => {
  if (!patrocinador || !nome) return null;

  return (
    <div className="flex justify-center">
      <Link
        href={`/patrocinadores/${encodeURIComponent(patrocinador)}`}
        className="inline-block bg-blue-100 font-poppins text-normal text-blue-700 font-semibold px-5 py-2 rounded-xl shadow hover:bg-blue-200 transition cursor-pointer"
      >
        Anunciado por:{" "}
        <span className="font-bold">{nome}</span>
      </Link>
    </div>
  );
};

export default PatrocinadorBadge;