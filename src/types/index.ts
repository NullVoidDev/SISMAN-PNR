export type ServiceCategory =
  | 'pedreiro'
  | 'marceneiro'
  | 'eletricista'
  | 'hidraulica'
  | 'pintura'
  | 'outros';

export type RequestStatus = 'pendente' | 'aprovado' | 'negado';

export interface MaintenanceRequest {
  id: string;
  pnrNumber: string;
  pnrAddress: string;
  requesterName: string;   // Nome de Guerra
  requesterRank: string;   // Graduação
  category: ServiceCategory;
  description: string;
  isUrgent: boolean;
  isArchived: boolean;
  images: string[];
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
  denialReason?: string;
}

export interface PNR {
  id: string;
  number: string;
  address: string;
  block: string;
}

export const SERVICE_CATEGORIES: Record<ServiceCategory, string> = {
  pedreiro: 'Pedreiro',
  marceneiro: 'Marceneiro',
  eletricista: 'Eletricista',
  hidraulica: 'Hidráulica',
  pintura: 'Pintura',
  outros: 'Outros',
};

export const STATUS_LABELS: Record<RequestStatus, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  negado: 'Negado',
};
