import { useEffect, useState } from "react";
import { buscarImoveis } from "@/services/buscaImoveis";
import { filtrarImoveisFrontend } from "./FiltroImoveis";
import type { Imovel } from "@/types/Imovel";
import { ITENS_POR_SETOR } from "@/constants/itensImovel";

interface ListaImoveisProps {
  filtros: Record<string, string>;
  setor: 'Residencial' | 'Comercial' | 'Rural';
  tipoNegocio: string;
}

export function ListaImoveis({ filtros, setor, tipoNegocio }: ListaImoveisProps) {
  const [imoveisFirestore, setImoveisFirestore] = useState<Imovel[]>([]);
  const [imoveisFiltrados, setImoveisFiltrados] = useState<Imovel[]>([]);
  const itensDisponiveis = ITENS_POR_SETOR[setor];

  useEffect(() => {
    async function fetchImoveis() {
      const imoveis = await buscarImoveis(filtros, setor, tipoNegocio);
      setImoveisFirestore(imoveis);
    }
    fetchImoveis();
  }, [filtros, setor, tipoNegocio]);

  useEffect(() => {
    setImoveisFiltrados(
      filtrarImoveisFrontend(imoveisFirestore, filtros, itensDisponiveis)
    );
  }, [imoveisFirestore, filtros, itensDisponiveis]);

  return (
    <div>
      {imoveisFiltrados.length === 0 && <div>Nenhum imóvel encontrado.</div>}
      {imoveisFiltrados.map(imovel => (
        <div key={imovel.id} style={{ border: "1px solid #eee", margin: 8, padding: 8 }}>
          <strong>
            {imovel.tipoImovel} - {imovel.enderecoDetalhado}
          </strong>
          {/* Exiba outros dados do imóvel aqui */}
        </div>
      ))}
    </div>
  );
}