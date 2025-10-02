import { supabase } from '@/lib/supabase';

/**
 * Função para sincronizar WhatsApp em imóveis existentes
 * Esta função deve ser executada uma vez para corrigir imóveis antigos
 */
export async function sincronizarWhatsAppImoveisExistentes() {
  try {
    console.log('Iniciando sincronização de WhatsApp em imóveis existentes...');

    // 1. Buscar todos os imóveis que não têm WhatsApp ou têm WhatsApp vazio
    const { data: imoveis, error: imoveisError } = await supabase
      .from('imoveis')
      .select('id, user_id, whatsapp')
      .or('whatsapp.is.null,whatsapp.eq.');

    if (imoveisError) {
      console.error('Erro ao buscar imóveis:', imoveisError);
      return { sucesso: false, erro: imoveisError.message };
    }

    if (!imoveis || imoveis.length === 0) {
      console.log('Nenhum imóvel encontrado para sincronização');
      return { sucesso: true, imoveisAtualizados: 0 };
    }

    console.log(`Encontrados ${imoveis.length} imóveis para sincronização`);

    let imoveisAtualizados = 0;
    let erros = 0;

    // 2. Para cada imóvel, buscar o telefone do usuário e atualizar
    for (const imovel of imoveis) {
      if (!imovel.user_id) {
        console.warn(`Imóvel ${imovel.id} não tem user_id, pulando...`);
        continue;
      }

      try {
        // Buscar telefone do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('telefone')
          .eq('id', imovel.user_id)
          .single();

        if (profileError || !profile?.telefone) {
          console.warn(`Usuário ${imovel.user_id} não tem telefone cadastrado`);
          continue;
        }

        // Atualizar WhatsApp do imóvel
        const { error: updateError } = await supabase
          .from('imoveis')
          .update({ 
            whatsapp: profile.telefone,
            updated_at: new Date().toISOString()
          })
          .eq('id', imovel.id);

        if (updateError) {
          console.error(`Erro ao atualizar imóvel ${imovel.id}:`, updateError);
          erros++;
        } else {
          imoveisAtualizados++;
          console.log(`Imóvel ${imovel.id} atualizado com WhatsApp: ${profile.telefone}`);
        }

      } catch (error) {
        console.error(`Erro inesperado no imóvel ${imovel.id}:`, error);
        erros++;
      }
    }

    console.log(`Sincronização concluída: ${imoveisAtualizados} imóveis atualizados, ${erros} erros`);

    return { 
      sucesso: true, 
      imoveisAtualizados, 
      erros,
      total: imoveis.length 
    };

  } catch (error) {
    console.error('Erro geral na sincronização:', error);
    return { 
      sucesso: false, 
      erro: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

/**
 * Função para verificar imóveis sem WhatsApp
 */
export async function verificarImoveisSemWhatsApp() {
  try {
    const { data, error } = await supabase
      .from('imoveis')
      .select('id, whatsapp, user_id')
      .or('whatsapp.is.null,whatsapp.eq.')
      .limit(10);

    if (error) {
      console.error('Erro ao verificar imóveis:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro na verificação:', error);
    return [];
  }
}