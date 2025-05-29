import React from "react";
import Image from "next/image";

interface UploadImagesProps {
  previews: string[];
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
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
  triggerFileInput,
  fileInputRef,
  required,
  imagensExistentes = [],
}: UploadImagesProps) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={e => e.preventDefault()}
      onClick={triggerFileInput}
      className="border-dashed border-2 p-4 rounded-lg text-center text-gray-600 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
    >
      <p>Arraste e solte imagens aqui ou clique para selecionar</p>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
        ref={fileInputRef}
        required={required}
      />
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {previews.map((preview, index) => (
          <div key={index} className="relative w-24 h-24">
            <Image
              src={preview}
              alt={`Preview ${index}`}
              fill
              className="object-cover rounded"
            />
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onRemove(index);
              }}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
              aria-label="Remover imagem"
            >
              ×
            </button>
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