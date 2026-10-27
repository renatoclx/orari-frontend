// Espelha a resposta de /users do backend (sem a senha, que a API nunca devolve).
import type { UserType } from "@/types/auth";

/** Tipo da pessoa que um usuário pode representar. */
export type LinkedPersonType = "PROFESSIONAL" | "EMPLOYEE";

// Itens que retornam de GET /users para listagem
export type UserListItem = {
  id: string;
  name: string;
  email: string;
  type: UserType;
  /** Pessoa vinculada (profissional ou funcionário); nulo = sem vínculo. */
  peopleId: string | null;
  /** Tipo e cargo da pessoa vinculada, para a coluna Função. */
  people: { type: LinkedPersonType; profession: string | null } | null;
  /** Nulo = ativo; preenchido = inativo (a listagem traz os dois). */
  deletedAt: string | null;
};

// Corpo do POST /users
export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  type: UserType;
  /** Obrigatório para o SUPER_ADMIN (a empresa do novo usuário); o ADMIN usa a própria. */
  companyId?: string;
  /** Pessoa (profissional ou funcionário) que o usuário representa; sem ela, não há vínculo. */
  peopleId?: string;
};

// Corpo de PATCH /users/:id: só o que mudar. A senha tem rota própria.
export type UpdateUserInput = Partial<{
  name: string;
  email: string;
  type: UserType;
  /** `null` desfaz o vínculo com o profissional. */
  peopleId: string | null;
}>;

// Corpo de PATCH /users/:id/password para troca de Senha
export type UpdatePasswordInput = {
  newPassword: string;
  newPasswordConfirmation: string;
};
