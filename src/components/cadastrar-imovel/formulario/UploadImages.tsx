import React from "react";
import Image from "next/image";

interface UploadImagesProps {
  previews: string[];
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  triggerFileInput: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  required?: boolean;
  imagensExistentes?: string[];
}

export default function UploadImages({
  previews,
  onDrop,
  onFileChange,
  onRemove,
  onReorder,
  triggerFileInput,
  fileInputRef,
  required,
  imagensExistentes = [],
}: UploadImagesProps) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  const handleDragStart = (index: number) => setDraggedIndex(index);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDropImage = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorder(draggedIndex, index);
    }
    setDraggedIndex(null);
  };

  const moveLeft = (index: number) => {
    if (index > 0) onReorder(index, index - 1);
  };
  
  const moveRight = (index: number) => {
    if (index < previews.length - 1) onReorder(index, index + 1);
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={e => e.preventDefault()}
      onClick={triggerFileInput}
      className="border-dashed border-2 p-4 rounded-lg text-center text-gray-600 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
    >
      <p className="mb-2">Arraste e solte imagens aqui, clique para selecionar ou use as setas para ordenar</p>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
        ref={fileInputRef}
        required={required}
      />
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {previews.map((preview, index) => (
          <div
            key={`${preview}-${index}`}
            className="relative w-28 h-28 flex flex-col items-center group bg-white rounded-lg shadow transition-all"
            draggable
            onDragStart={e => {
              e.stopPropagation();
              handleDragStart(index);
            }}
            onDragOver={handleDragOver}
            onDrop={e => {
              e.stopPropagation();
              handleDropImage(index);
            }}
            style={{
              opacity: draggedIndex === index ? 0.5 : 1,
              border: draggedIndex === index ? "2px dashed #3b82f6" : "2px solid transparent",
              cursor: "grab",
              transition: "border 0.2s, opacity 0.2s"
            }}
          >
            <Image
              src={preview}
              alt={`Preview ${index}`}
              fill
              className="object-cover rounded-lg"
              style={{ zIndex: 1 }}
              sizes="112px"
              onError={() => {
                console.error('Erro ao carregar imagem:', preview);
              }}
            />
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onRemove(index);
              }}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer shadow hover:bg-red-600 z-10"
              aria-label="Remover imagem"
              tabIndex={-1}
            >
              ×
            </button>
            <div className="absolute bottom-1 left-1 right-1 flex justify-between items-center opacity-80 group-hover:opacity-100 transition-opacity z-10">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  moveLeft(index);
                }}
                className="bg-white border border-gray-300 rounded-full w-7 h-7 flex items-center justify-center shadow hover:bg-blue-100 transition disabled:opacity-30"
                disabled={index === 0}
                aria-label="Mover para a esquerda"
                tabIndex={-1}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path d="M15 18l-6-6 6-6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  moveRight(index);
                }}
                className="bg-white border border-gray-300 rounded-full w-7 h-7 flex items-center justify-center shadow hover:bg-blue-100 transition disabled:opacity-30"
                disabled={index === previews.length - 1}
                aria-label="Mover para a direita"
                tabIndex={-1}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path d="M9 6l6 6-6 6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      {imagensExistentes.length > 0 && (
        <p className="text-sm text-gray-500 mt-2">
          {imagensExistentes.length} imagem(ns) já cadastrada(s)
        </p>
      )}
    </div>
  );
}