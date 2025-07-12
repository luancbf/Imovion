import { useState } from 'react';
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
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

  const uploadSliderImage = async (file: File, imageName: string): Promise<string> => {
    const validation = validateImage(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `slider_${imageName}_${Date.now()}.${fileExt}`;
      const filePath = `slider/${fileName}`;

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