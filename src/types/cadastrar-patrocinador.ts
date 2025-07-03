export interface Patrocinador {
  id: string;
  nome: string;
  slug: string;
  bannerUrl?: string;
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

// Constantes
export const availableSliderImages: SliderImageInfo[] = [
  {
    name: 'banner-1.png',
    title: 'Banner Principal 1',
    description: 'Primeira imagem do slider'
  },
  {
    name: 'banner-2.png', 
    title: 'Banner Principal 2',
    description: 'Segunda imagem do slider'
  },
  {
    name: 'banner-3.png',
    title: 'Banner Principal 3', 
    description: 'Terceira imagem do slider'
  }
];

export const patrocinioPositions = [
  {
    id: 'pos-1',
    name: 'Posição 1',
    description: '1ª posição dos patrocínios'
  },
  {
    id: 'pos-2',
    name: 'Posição 2',
    description: '2ª posição dos patrocínios'
  },
  {
    id: 'pos-3',
    name: 'Posição 3',
    description: '3ª posição dos patrocínios'
  },
  {
    id: 'pos-4',
    name: 'Posição 4',
    description: '4ª posição dos patrocínios'
  },
  {
    id: 'pos-5',
    name: 'Posição 5',
    description: '5ª posição dos patrocínios'
  },
  {
    id: 'pos-6',
    name: 'Posição 6',
    description: '6ª posição dos patrocínios'
  },
  {
    id: 'pos-7',
    name: 'Posição 7',
    description: '7ª posição dos patrocínios'
  },
  {
    id: 'pos-8',
    name: 'Posição 8',
    description: '8ª posição dos patrocínios'
  }
];