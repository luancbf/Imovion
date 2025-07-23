'use client';

import Link from 'next/link';

interface PatrocinadorBadgeProps {
  patrocinador: string;
  nome: string;
  creci?: string;
}

const PatrocinadorBadge: React.FC<PatrocinadorBadgeProps> = ({ patrocinador, nome, creci }) => {
  if (!patrocinador || !nome) return null;

  return (
    <div className="flex flex-col items-center">
      <Link
        href={`/patrocinadores/${encodeURIComponent(patrocinador)}`}
        className="inline-block font-poppins font-semibold text-normal lg:text-xl text-blue-900 transition cursor-pointer"
      >
        <span className="flex items-center">
          {nome}
          {creci && (
            <span className="ml-1 align-middle">
              | CRECI: {creci}
            </span>
          )}
        </span>
      </Link>
    </div>
  );
};

export default PatrocinadorBadge;