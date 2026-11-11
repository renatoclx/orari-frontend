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
  /** Aceita atendimento em turma (ver /turmas). */
  allowsClasses: boolean;
  isActive: boolean;
  /**
   * Comissão do profissional por atendimento: PERCENT (do valor cobrado) ou
   * FIXED (valor). Só vem para o ADMIN; para os demais, os campos não existem.
   */
  commissionType?: CommissionType | null;
  /** Percentual ou valor em reais, em texto (ex.: "40.00"). */
  commissionValue?: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type CommissionType = "PERCENT" | "FIXED";

/** Corpo de POST e PATCH /services. `null` limpa um campo opcional (PATCH). */
export type ServiceInput = {
  name: string;
  description: string | null;
  /** Em reais, com até 2 casas decimais. */
  price: number | null;
  duration: number;
  color: string | null;
  /** Só vai com Turmas liberadas; ausente, o valor gravado não muda. */
  allowsClasses?: boolean;
  /** Só o ADMIN envia; ausente, a comissão gravada não muda. */
  commissionType?: CommissionType | null;
  commissionValue?: number | null;
};
