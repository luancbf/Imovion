import { useState } from 'react';

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
    const validation = validateImage(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("imagem", file);
      formData.append("pasta", "slider");

      const res = await fetch("/api/upload-imagem", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();

      if (!data.url) {
        throw new Error(data.error || "URL não retornada pela API");
      }

      return data.url;
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const uploadPatrocinioImage = async (file: File): Promise<string> => {
    const validation = validateImage(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("imagem", file);
      formData.append("pasta", "patrocinios");

      const res = await fetch("/api/upload-imagem", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();

      if (!data.url) {
        throw new Error(data.error || "URL não retornada pela API");
      }

      return data.url;
    } catch (error) {
      throw error;
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