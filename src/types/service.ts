// Espelha a resposta de /services do backend (model Service).

export type ServiceItem = {
  id: string;
  name: string;
  description: string | null;
  /** O Decimal do banco chega como texto (ex.: "50.00"). */
  price: string | null;
  /** Duração em minutos. */
  duration: number;
  /** Cor hexadecimal exibida no agendamento (ex.: "#3BB2F6"). */
  color: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};
