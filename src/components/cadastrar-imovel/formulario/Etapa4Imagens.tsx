"use client";

import { FiUpload } from "react-icons/fi";
import UploadImages from "./UploadImages";

interface Etapa4Props {
  previews: string[];
  imagensExistentes: string[];
  imagensNovas: File[];
  modoEdicao: boolean;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function Etapa4Imagens({ 
  previews, 
  imagensExistentes, 
  imagensNovas, 
  modoEdicao,
  onDrop,
  onFileChange,
  onRemove,
  fileInputRef
}: Etapa4Props) {
  return (
    <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
      <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2 font-poppins">
        <FiUpload size={20} />
        Galeria de Imagens
        {modoEdicao && (
          <span className="text-sm bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
            {imagensExistentes.length} existente(s) + {imagensNovas.length} nova(s)
          </span>
        )}
      </h3>
      
      <UploadImages
        previews={previews}
        onDrop={onDrop}
        onFileChange={onFileChange}
        onRemove={onRemove}
        onReorder={() => {}} // Simplificado para esta versão
        fileInputRef={fileInputRef}
        required={previews.length === 0}
        imagensExistentes={imagensExistentes}
        triggerFileInput={() => fileInputRef.current?.click()}
      />
    </div>
  );
}