'use client';

import Image from 'next/image';

interface ImovelModalProps {
  imagens: string[];
  aberto: boolean;
  imagemIndex: number;
  onClose: () => void;
  onAnterior: () => void;
  onProxima: () => void;
  setImagemIndex: (index: number) => void;
  handleBackgroundClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const ImovelModal: React.FC<ImovelModalProps> = ({
  imagens,
  aberto,
  imagemIndex,
  onClose,
  onAnterior,
  onProxima,
  setImagemIndex,
  handleBackgroundClick,
}) => {
  if (!aberto || !imagens || imagens.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={handleBackgroundClick}
      tabIndex={-1}
    >
      <div className="relative max-w-3xl w-full flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white/90 text-blue-700 rounded-full p-2 shadow hover:bg-blue-100 transition cursor-pointer z-10"
          aria-label="Fechar modal"
          type="button"
        >
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <div className="w-full flex items-center justify-center">
          <button
            onClick={onAnterior}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 text-blue-700 p-2 rounded-full shadow hover:bg-blue-100 transition cursor-pointer"
            aria-label="Imagem anterior"
            type="button"
          >
            <svg width={28} height={28} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
          </button>
          <Image
            src={imagens[imagemIndex]}
            alt={`Imagem ampliada ${imagemIndex + 1}`}
            width={900}
            height={600}
            className="max-h-[80vh] w-auto h-auto rounded-2xl shadow-lg bg-white"
            style={{ maxWidth: '90vw', objectFit: 'contain' }}
            priority
          />
          <button
            onClick={onProxima}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 text-blue-700 p-2 rounded-full shadow hover:bg-blue-100 transition cursor-pointer"
            aria-label="Próxima imagem"
            type="button"
          >
            <svg width={28} height={28} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
        {/* Miniaturas no modal */}
        {imagens.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {imagens.map((img, index) => (
              <button
                key={index}
                onClick={() => setImagemIndex(index)}
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden border-2 transition ${
                  imagemIndex === index ? 'border-blue-500' : 'border-transparent'
                } cursor-pointer`}
                aria-label={`Selecionar imagem ${index + 1}`}
                type="button"
              >
                <Image
                  src={img}
                  alt={`Miniatura modal ${index + 1}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover hover:opacity-80"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImovelModal;