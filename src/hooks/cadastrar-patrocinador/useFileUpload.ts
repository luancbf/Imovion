import { useState } from 'react';
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);

  const validateImage = (file: File): { valid: boolean; error?: string } => {
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Arquivo deve ser uma imagem' };
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, error: 'Imagem deve ter no máximo 5MB' };
    }
    
    return { valid: true };
  };

  const uploadSliderImage = async (file: File): Promise<string> => {
    console.log("Hook: Iniciando upload do arquivo:", file.name, file.size);
    
    const validation = validateImage(file);
    if (!validation.valid) {
      console.log("Hook: Validação falhou:", validation.error);
      throw new Error(validation.error);
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("imagem", file);
      formData.append("pasta", "slider");
      
      console.log("Hook: Enviando requisição para /api/upload-imagem");
      const res = await fetch("/api/upload-imagem", {
        method: "POST",
        body: formData,
      });
      
      console.log("Hook: Status da resposta:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.log("Hook: Erro HTTP:", errorText);
        throw new Error(`Erro HTTP ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      console.log("Hook: Resposta completa:", data);
      
      if (!data.url) {
        throw new Error(data.error || "URL não retornada pela API");
      }
      
      return data.url;
    } catch (error) {
      console.log("Hook: Erro capturado:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const uploadPatrocinioImage = async (file: File, positionId: string): Promise<string> => {
    const validation = validateImage(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `patrocinio_${positionId}_${Date.now()}.${fileExt}`;
      const filePath = `patrocinios/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('imagens')
        .upload(filePath, file);

      if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);

      const { data: urlData } = supabase.storage
        .from('imagens')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadSliderImage,
    uploadPatrocinioImage
  };
};