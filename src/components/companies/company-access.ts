import type {
  AccessAction,
  AccessMatrix,
  CompanyAccess,
  CompanyLimits,
  FeatureAccess,
  FeatureAccessEntry,
} from "@/types/company-access";

export const ACCESS_ACTIONS: { key: AccessAction; label: string }[] = [
  { key: "view", label: "Visualiza" },
  { key: "edit", label: "Edita" },
  { key: "create", label: "Cria" },
  { key: "remove", label: "Exclui/Inativa" },
];

const ALL_ACTIONS = ACCESS_ACTIONS.map((action) => action.key);

type AccessFeature = {
  key: string;
  label: string;
  /** Colunas que fazem sentido para a funcionalidade (as demais ficam em "–"). */
  actions: AccessAction[];
};

// Uma linha por funcionalidade do menu. A Ajuda não entra: é sempre visível.
// Funcionalidade nova entra aqui e nasce desmarcada (`emptyMatrix`).
export const ACCESS_GROUPS: { label: string; features: AccessFeature[] }[] = [
  {
    label: "Agenda",
    features: [
      { key: "appointments", label: "Agendamentos", actions: ALL_ACTIONS },
      { key: "recurrences", label: "Recorrências", actions: ALL_ACTIONS },
    ],
  },
  {
    label: "Cadastros",
    features: [
      { key: "clients", label: "Clientes", actions: ALL_ACTIONS },
      { key: "employees", label: "Funcionários", actions: ALL_ACTIONS },
      { key: "professionals", label: "Profissionais", actions: ALL_ACTIONS },
      { key: "suppliers", label: "Fornecedores", actions: ALL_ACTIONS },
      { key: "users", label: "Usuários", actions: ALL_ACTIONS },
      { key: "services", label: "Serviços", actions: ALL_ACTIONS },
    ],
  },
  {
    label: "Pacotes",
    features: [
      { key: "plans", label: "Planos", actions: ALL_ACTIONS },
      { key: "contracts", label: "Contratações", actions: ALL_ACTIONS },
    ],
  },
  {
    label: "Financeiro",
    features: [
      { key: "tabs", label: "Comandas", actions: ALL_ACTIONS },
      { key: "payments", label: "Contas a receber", actions: ALL_ACTIONS },
      {
        key: "payment-methods",
        label: "Métodos de pagamento",
        actions: ALL_ACTIONS,
      },
      // Só o ADMIN. Pagar = Edita; cancelar e excluir = Exclui.
      { key: "payables", label: "Contas a pagar", actions: ALL_ACTIONS },
      // Só o ADMIN usa (contas a pagar).
      {
        key: "expense-categories",
        label: "Categorias de despesa",
        actions: ALL_ACTIONS,
      },
      // Só o ADMIN. Edita = fechar; Cria = lançar adiantamento; Exclui =
      // excluir adiantamento ou desfazer fechamento. A API exige ver
      // Profissionais e Pagamentos.
      { key: "commissions", label: "Comissões", actions: ALL_ACTIONS },
    ],
  },
  {
    label: "Produtos",
    features: [
      // Só o ADMIN. Exclui/Inativa = inativar (não há exclusão de categoria).
      {
        key: "product-categories",
        label: "Categorias de produto",
        actions: ALL_ACTIONS,
      },
      // Só o ADMIN. A API exige ver Categorias de produto.
      { key: "products", label: "Produtos", actions: ALL_ACTIONS },
      // Venda na comanda (só o ADMIN vende): Cria = vender; Exclui = cancelar
      // a venda pendente; não há alteração. A API exige Comandas e Produtos.
      {
        key: "product-sales",
        label: "Venda de produtos",
        actions: ["view", "create", "remove"],
      },
    ],
  },
  {
    label: "Anamnese",
    features: [
      { key: "anamnesis", label: "Fichas", actions: ALL_ACTIONS },
      {
        key: "anamnesis-templates",
        label: "Modelos de ficha",
        actions: ALL_ACTIONS,
      },
      { key: "anamnesis-audit", label: "Auditoria", actions: ["view"] },
    ],
  },
  {
    label: "Turmas",
    features: [{ key: "class-groups", label: "Turmas", actions: ALL_ACTIONS }],
  },
  {
    label: "Empresa",
    features: [
      {
        key: "settings",
        label: "Configurações",
        actions: ["view", "edit"],
      },
      // Visualiza = portal disponível à clínica; Edita = mudar as regras dele.
      {
        key: "client-portal",
        label: "Portal do cliente",
        actions: ["view", "edit"],
      },
      // Mensagens automáticas ao cliente do app; a API exige o Portal do cliente.
      { key: "messages", label: "Mensagens", actions: ["view", "edit"] },
    ],
  },
  {
    label: "Relatórios",
    features: [
      // Só leitura; a API exige ver Clientes e Profissionais.
      {
        key: "client-portfolio",
        label: "Carteira de clientes",
        actions: ["view"],
      },
      // Só leitura; a API exige ver Pagamentos e Clientes.
      {
        key: "receivables",
        label: "Análise de recebíveis",
        actions: ["view"],
      },
      // Só leitura; a API exige ver Agendamentos.
      {
        key: "appointments-report",
        label: "Agendamentos",
        actions: ["view"],
      },
      // Só leitura; a API exige ver Agendamentos e Pagamentos.
      {
        key: "rankings",
        label: "Rankings",
        actions: ["view"],
      },
      // Só leitura; a API exige ver Pagamentos.
      {
        key: "financial-report",
        label: "Financeiro",
        actions: ["view"],
      },
      // Só leitura; a API exige ver Contratações.
      {
        key: "packages-report",
        label: "Pacotes",
        actions: ["view"],
      },
      // Só leitura; a API exige ver Clientes e Agendamentos.
      {
        key: "clients-report",
        label: "Perfil do cliente",
        actions: ["view"],
      },
      // Só a tela; cada bloco segue o relatório de origem.
      {
        key: "dashboard",
        label: "Dashboard",
        actions: ["view"],
      },
    ],
  },
];

const FEATURES = ACCESS_GROUPS.flatMap((group) => group.features);

const NONE: FeatureAccess = {
  view: false,
  edit: false,
  create: false,
  remove: false,
};

/** Tudo desmarcado: assim nasce uma funcionalidade nova. */
export function emptyMatrix(): AccessMatrix {
  return Object.fromEntries(
    FEATURES.map((feature) => [feature.key, { ...NONE }]),
  );
}

// Liga todas as colunas que existem nas funcionalidades pedidas.
function matrixWith(enabled: (featureKey: string) => boolean): AccessMatrix {
  return Object.fromEntries(
    FEATURES.map((feature) => [
      feature.key,
      Object.fromEntries(
        ALL_ACTIONS.map((action) => [
          action,
          enabled(feature.key) && feature.actions.includes(action),
        ]),
      ) as FeatureAccess,
    ]),
  );
}

export function isActionApplicable(
  featureKey: string,
  action: AccessAction,
): boolean {
  return (
    FEATURES.find((feature) => feature.key === featureKey)?.actions.includes(
      action,
    ) ?? false
  );
}

/**
 * Marca ou desmarca uma célula. Edita, Cria e Exclui/Inativa exigem
 * Visualiza: desmarcar Visualiza limpa a linha, e marcar qualquer outra
 * garante o Visualiza.
 */
export function toggleAccess(
  matrix: AccessMatrix,
  featureKey: string,
  action: AccessAction,
  checked: boolean,
): AccessMatrix {
  const current = matrix[featureKey];
  if (!current || !isActionApplicable(featureKey, action)) return matrix;
  let next: FeatureAccess;
  if (action === "view") {
    next = checked ? { ...current, view: true } : { ...NONE };
  } else {
    next = { ...current, [action]: checked, view: checked || current.view };
  }
  return { ...matrix, [featureKey]: next };
}

// Funcionalidades que cada modelo deixa de fora.
const ANAMNESIS_KEYS = ["anamnesis", "anamnesis-templates", "anamnesis-audit"];
const CLASS_KEYS = ["class-groups"];
// Portal do cliente e Mensagens ficam fora de todos os modelos por enquanto: o
// SUPER_ADMIN libera empresa por empresa (backend: migração client_portal_off).
const PORTAL_KEYS = ["client-portal", "messages"];
// Produtos também ficam fora de todos os modelos: o SUPER_ADMIN libera a quem
// contratar (backend: DEFAULT_OFF).
const PRODUCT_KEYS = ["product-categories", "products", "product-sales"];
// Relatórios por versão (a revisar): os da agenda em todas; os do dinheiro a
// partir do Essencial; os demais a partir do Profissional.
const FULL_REPORT_KEYS = [
  "rankings",
  "client-portfolio",
  "clients-report",
  "packages-report",
];
// Versão só de agendamento: agenda, cadastros, configurações, o app do
// cliente e os relatórios da agenda; sem pacotes nem financeiro.
const AGENDA_KEYS = [
  "appointments",
  "recurrences",
  "clients",
  "employees",
  "professionals",
  "users",
  "services",
  "settings",
  "client-portal",
  "appointments-report",
  "dashboard",
];

export type AccessTemplate = {
  key: string;
  label: string;
  matrix: AccessMatrix;
  admins: number;
  /** Só o Essencial tem limite decidido; nos demais, o valor atual é mantido. */
  professionals?: number;
};

// Nomes provisórios (Obsidian: Planos 00). Os modelos só preenchem a tela;
// depois de aplicados, tudo continua editável.
export const ACCESS_TEMPLATES: AccessTemplate[] = [
  {
    key: "agenda",
    label: "Agenda",
    matrix: matrixWith((key) => AGENDA_KEYS.includes(key)),
    admins: 1,
  },
  {
    key: "essential",
    label: "Essencial",
    matrix: matrixWith(
      (key) =>
        !ANAMNESIS_KEYS.includes(key) &&
        !CLASS_KEYS.includes(key) &&
        !PORTAL_KEYS.includes(key) &&
        !PRODUCT_KEYS.includes(key) &&
        !FULL_REPORT_KEYS.includes(key),
    ),
    admins: 1,
    professionals: 3,
  },
  {
    key: "professional",
    label: "Profissional",
    matrix: matrixWith(
      (key) =>
        !CLASS_KEYS.includes(key) &&
        !PORTAL_KEYS.includes(key) &&
        !PRODUCT_KEYS.includes(key),
    ),
    admins: 1,
  },
  {
    key: "complete",
    label: "Completo",
    matrix: matrixWith(
      (key) => !PORTAL_KEYS.includes(key) && !PRODUCT_KEYS.includes(key),
    ),
    admins: 2,
  },
];

export function applyTemplate(
  template: AccessTemplate,
  current: CompanyAccess,
): CompanyAccess {
  return {
    matrix: template.matrix,
    limits: {
      professionals: template.professionals ?? current.limits.professionals,
      admins: template.admins,
    },
  };
}

export const MAX_LIMIT = 999;

export type LimitValues = Record<keyof CompanyLimits, string>;
export type LimitErrors = Partial<Record<keyof CompanyLimits, string>>;

/** Inteiro de 1 a 999; qualquer outra coisa (vazio, 0, decimal) vira `undefined`. */
export function parseLimit(value: string): number | undefined {
  if (!/^\d+$/.test(value.trim())) return undefined;
  const number = Number(value);
  return number >= 1 && number <= MAX_LIMIT ? number : undefined;
}

export function validateLimits(values: LimitValues): LimitErrors {
  const errors: LimitErrors = {};
  for (const field of ["professionals", "admins"] as const) {
    if (parseLimit(values[field]) === undefined) {
      errors[field] = `Informe um número inteiro de 1 a ${MAX_LIMIT}.`;
    }
  }
  return errors;
}

/**
 * Aviso (não erro) quando o limite fica abaixo do uso: a empresa continua
 * funcionando e só não cadastra novos.
 */
export function limitWarning(value: string, used: number): string | undefined {
  const limit = parseLimit(value);
  if (limit === undefined || limit >= used) return undefined;
  return "Abaixo do que a empresa já usa: ela continua funcionando e só não cadastra novos.";
}

/** Lista da API (uma entrada por funcionalidade) para a matriz da tela. */
export function matrixFromEntries(entries: FeatureAccessEntry[]): AccessMatrix {
  const matrix = emptyMatrix();
  for (const { feature, ...flags } of entries) {
    // Funcionalidade que a tela não conhece (API mais nova) é ignorada.
    if (feature in matrix) matrix[feature] = flags;
  }
  return matrix;
}

/** Matriz da tela para a lista que a API recebe (todas as funcionalidades). */
export function entriesFromMatrix(matrix: AccessMatrix): FeatureAccessEntry[] {
  return Object.entries(matrix).map(([feature, flags]) => ({
    feature,
    ...flags,
  }));
}
