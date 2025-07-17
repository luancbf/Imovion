export interface Patrocinador {
  id: string;
  nome: string;
  slug: string;
  telefone?: string;
  creci?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  ownerId?: string;
}

export interface PatrocinioConfig {
  id?: string;
  position: number;
  display_order?: number;
  image_name?: string;
  image_url?: string | null;
  image_alt?: string | null;
  patrocinador_id?: string | null;
  is_active: boolean;
  is_clickable: boolean;
  created_at?: string;
  updated_at?: string;
  patrocinadores?: {
    id: string;
    nome: string;
    slug: string;
    telefone?: string;
  } | null;
}

export interface SliderBanner {
  id?: string;
  image_name: string;
  image_url: string | null;
  image_alt: string | null;
  patrocinador_id: string | null;
  is_active: boolean;
  is_clickable: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  patrocinadores?: {
    id: string;
    nome: string;
    slug: string;
    telefone?: string;
  } | null;
}

export interface SliderImageInfo {
  name: string;
  title: string;
  description: string;
}

export interface PatrocinioPosition {
  id: string;
  name: string;
  description: string;
}

export const availableSliderImages: SliderImageInfo[] = [
  {name: 'principal1', title: 'Banner Principal 1', description: 'Primeira imagem do slider principal'},
  {name: 'principal2', title: 'Banner Principal 2', description: 'Segunda imagem do slider principal'},
  {name: 'principal3', title: 'Banner Principal 3', description: 'Terceira imagem do slider principal'},
  {name: 'principal4', title: 'Banner Principal 4', description: 'Quarta imagem do slider principal'},
  {name: 'principal5', title: 'Banner Principal 5', description: 'Quinta imagem do slider principal'},
  {name: 'principal6', title: 'Banner Principal 6', description: 'Sexta imagem do slider principal'},
  
  {name: 'secundario1', title: 'Banner Secundário 1', description: 'Primeira imagem do slider secundário'},
  {name: 'secundario2', title: 'Banner Secundário 2', description: 'Segunda imagem do slider secundário'},
  {name: 'secundario3', title: 'Banner Secundário 3', description: 'Terceira imagem do slider secundário'},
  {name: 'secundario4', title: 'Banner Secundário 4', description: 'Quarta imagem do slider secundário'},
  {name: 'secundario5', title: 'Banner Secundário 5', description: 'Quinta imagem do slider secundário'},
  {name: 'secundario6', title: 'Banner Secundário 6', description: 'Sexta imagem do slider secundário'}
];

export interface SliderType {
  type: 'principal' | 'secundario';
  name: string;
  description: string;
}

export const patrocinioPositions = [
  { id: 'pos-1', name: 'Posição 1', description: '1ª posição dos patrocínios' },
  { id: 'pos-2', name: 'Posição 2', description: '2ª posição dos patrocínios' },
  { id: 'pos-3', name: 'Posição 3', description: '3ª posição dos patrocínios' },
  { id: 'pos-4', name: 'Posição 4', description: '4ª posição dos patrocínios' },
  { id: 'pos-5', name: 'Posição 5', description: '5ª posição dos patrocínios' },
  { id: 'pos-6', name: 'Posição 6', description: '6ª posição dos patrocínios' },
  { id: 'pos-7', name: 'Posição 7', description: '7ª posição dos patrocínios' },
  { id: 'pos-8', name: 'Posição 8', description: '8ª posição dos patrocínios' },
  { id: 'pos-9', name: 'Posição 9', description: '9ª posição dos patrocínios' },
  { id: 'pos-10', name: 'Posição 10', description: '10ª posição dos patrocínios' },
  { id: 'pos-11', name: 'Posição 11', description: '11ª posição dos patrocínios' },
  { id: 'pos-12', name: 'Posição 12', description: '12ª posição dos patrocínios' },
  { id: 'pos-13', name: 'Posição 13', description: '13ª posição dos patrocínios' },
  { id: 'pos-14', name: 'Posição 14', description: '14ª posição dos patrocínios' },
  { id: 'pos-15', name: 'Posição 15', description: '15ª posição dos patrocínios' },
  { id: 'pos-16', name: 'Posição 16', description: '16ª posição dos patrocínios' }
];