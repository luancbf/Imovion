import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Imovel } from "@/types/Imovel";

export async function buscarImoveis(
  filtros: Record<string, string>,
  setor: string,
  tipoNegocio: string
): Promise<Imovel[]> {
  let q = query(collection(db, "imoveis"));

  // Setor e tipoNegocio já vêm fixos da página
  q = query(q, where("setor", "==", setor));
  q = query(q, where("tipoNegocio", "==", tipoNegocio));

  // Demais filtros opcionais
  if (filtros.cidade) {
    q = query(q, where("cidade", "==", filtros.cidade));
  }
  if (filtros.bairro) {
    q = query(q, where("bairro", "==", filtros.bairro));
  }

  // NÃO filtre por itens aqui!

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      cidade: data.cidade ?? "",
      bairro: data.bairro ?? "",
      enderecoDetalhado: data.enderecoDetalhado ?? "",
      valor: data.valor ?? 0,
      metragem: data.metragem ?? 0,
      descricao: data.descricao ?? "",
      tipoImovel: data.tipoImovel ?? "",
      tipoNegocio: data.tipoNegocio ?? "",
      setorNegocio: data.setorNegocio ?? "",
      whatsapp: data.whatsapp ?? "",
      patrocinador: data.patrocinador ?? "",
      imagens: data.imagens ?? [],
      dataCadastro: data.dataCadastro ?? "",
      itens: data.itens ?? {},
    } as Imovel;
  });
}