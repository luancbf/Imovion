'use client';

import Image from 'next/image';

interface ImovelCarouselProps {
  imagens: string[];
  imagemAtual: number;
  setImagemAtual: (index: number) => void;
  abrirModal: (index: number) => void;
  proximaImagem: () => void;
  imagemAnterior: () => void;
}

const ImovelCarousel: React.FC<ImovelCarouselProps> = ({
  imagens,
  imagemAtual,
  setImagemAtual,
  abrirModal,
  proximaImagem,
  imagemAnterior,
}) => {
  if (!imagens || imagens.length === 0) {
    return (
      <Image
        src="/sem-imagem.jpg"
        alt="Sem imagem"
        width={800}
        height={320}
        className="w-full h-56 sm:h-80 object-cover rounded-2xl shadow"
        priority
      />
    );
  }

  return (
    <div className="relative mb-6 group">
      <Image
        src={imagens[imagemAtual]}
        alt={`Imagem ${imagemAtual + 1}`}
        width={800}
        height={320}
        className="w-full h-56 sm:h-80 object-cover rounded-2xl shadow transition-transform duration-500 group-hover:scale-105 cursor-pointer"
        priority
        onClick={() => abrirModal(imagemAtual)}
      />

      {imagens.length > 1 && (
        <>
          <button
            onClick={imagemAnterior}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/80 text-blue-700 p-2 rounded-full shadow hover:bg-blue-100 transition cursor-pointer"
            aria-label="Imagem anterior"
            type="button"
          >
            <svg width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button
            onClick={proximaImagem}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/80 text-blue-700 p-2 rounded-full shadow hover:bg-blue-100 transition cursor-pointer"
            aria-label="Próxima imagem"
            type="button"
          >
            <svg width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          </button>
        </>
      )}

      {/* Miniaturas */}
      {imagens.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {imagens.map((img, index) => (
            <button
              key={index}
              onClick={() => {
                setImagemAtual(index);
                abrirModal(index);
              }}
              className={`w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden border-2 transition ${
                imagemAtual === index ? 'border-blue-500' : 'border-transparent'
              } cursor-pointer`}
              aria-label={`Selecionar imagem ${index + 1}`}
              type="button"
            >
              <Image
                src={img}
                alt={`Miniatura ${index + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-cover hover:opacity-80"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}

      {/* Indicadores (bolinhas) */}
      {imagens.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-2">
          {imagens.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setImagemAtual(index);
                abrirModal(index);
              }}
              className={`w-3 h-3 rounded-full border-none p-0 ${
                imagemAtual === index ? 'bg-blue-600' : 'bg-gray-300'
              } cursor-pointer`}
              aria-label={`Ir para imagem ${index + 1}`}
              type="button"
            ></button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImovelCarousel;