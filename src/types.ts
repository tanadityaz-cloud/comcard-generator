export interface PhotoItem {
  url: string;
  zoom: number; // 0.5 to 2.5
  cropX: number; // -100 to 100
  cropY: number; // -100 to 100
  driveFileId?: string;
  driveLink?: string;
  fileName?: string;
}

export interface ModelStats {
  height: string;
  weight: string;
  bust: string;
  waist: string;
  hips: string;
  shoeSize: string;
  clothingSize: string;
  hair: string;
  eyes: string;
  skinTone: string;
}

export interface ModelContact {
  phone: string;
  email: string;
  instagram: string;
  website: string;
  agency: string;
}

export type TemplateId =
  | 'classic'
  | 'editorial'
  | 'minimal'
  | 'vogue_haute'
  | 'runway_bold'
  | 'cinema_film'
  | 'noir_monochrome'
  | 'polaroid_studio'
  | 'paris_atelier'
  | 'milan_runway'
  | 'tokyo_neo'
  | 'nordic_clean'
  | 'img_digis'
  | 'select_six';

export interface ModelExperience {
  showOnCard: boolean;
  headline: string;
  items: string[];
  bio?: string;
}

export interface Comcard {
  id: string;
  name: string;
  displayName: string;
  age: string;
  gender: string;
  nationality: string;
  stats: ModelStats;
  contact: ModelContact;
  visibleStats: {
    height: boolean;
    weight: boolean;
    bust: boolean;
    waist: boolean;
    hips: boolean;
    shoeSize: boolean;
    clothingSize: boolean;
    hair: boolean;
    eyes: boolean;
  };
  templateId: TemplateId;
  accentColor: string;
  experience?: ModelExperience;
  photos: {
    main: PhotoItem;
    grid1: PhotoItem;
    grid2: PhotoItem;
    grid3: PhotoItem;
    grid4: PhotoItem;
    grid5?: PhotoItem;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TemplateOption {
  id: TemplateId;
  name: string;
  tagline: string;
  description: string;
  previewUrl: string;
  aspectRatio: string;
}
