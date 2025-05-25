'use client';

import Link from 'next/link';

interface PatrocinadorBadgeProps {
  patrocinador: string;
}

const PatrocinadorBadge: React.FC<PatrocinadorBadgeProps> = ({ patrocinador }) => {
  if (!patrocinador) return null;

  return (
    <div className="flex justify-center mb-6">
      <Link
        href={`/patrocinadores/${patrocinador}`}
        className="inline-block bg-blue-100 text-blue-700 font-semibold px-5 py-2 rounded-xl shadow hover:bg-blue-200 transition cursor-pointer"
      >
        Anunciado por: {patrocinador.replace(/_/g, ' ')}
      </Link>
    </div>
  );
};

export default PatrocinadorBadge;