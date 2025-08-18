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

  const uploadPatrocinioImage = async (file: File, fileName: string): Promise<string> => {
    console.log(`🔄 Iniciando upload de patrocínio: ${fileName}`);
    
    const validation = validateImage(file);
    if (!validation.valid) {
      console.log("❌ Validação falhou:", validation.error);
      throw new Error(validation.error);
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("imagem", file);
      formData.append("pasta", "patrocinios"); // ✅ Especifica pasta patrocinios
      
      console.log(`📤 Fazendo upload do arquivo: ${file.name} para pasta: patrocinios`);
      
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

      console.log(`✅ Imagem de patrocínio uploadada: ${data.url}`);
      console.log(`📁 Caminho do arquivo: ${data.path}`);
      
      return data.url;
    } catch (error) {
      console.error(`❌ Erro no upload de patrocínio:`, error);
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