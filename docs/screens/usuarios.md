# Usuários

## Listagem

### Colunas

- Nome
- E-mail
- Tipo de Usuário
- Status
- Ações
  - Visualizar
  - Alterar usuário.
  - Alterar senha
  - Inativar.
  - Reativar (só nos inativos).

### Regras específicas

- O status é controlado pelo deletedAt. A listagem traz ativos e inativos, do mais recente para o mais antigo, com paginação (a API não tem busca por nome).
- Tipo de usuário deve ser exibido como Badge (Super administrador, Administrador, Usuário).
- "Alterar" em destaque; as demais ações no menu de três pontos.
- Usuário inativo só tem Visualizar e Reativar (a API não altera usuário inativo).
- O usuário logado aparece com "(você)", não tem "Inativar" e não pode alterar o próprio tipo.
- O ADMIN não vê contas SUPER_ADMIN e não pode atribuir esse tipo (a opção não aparece).

---

## Cadastro

### Campos

- Nome
- E-mail
- Tipo de Usuário
- Senha
- Confirme a senha

### Regras Específicas

- Nome obrigatório;
- E-mail obrigatório;
- Tipo de Usuário obrigatório;
- Senha Obrigatória, de 8 a 72 caracteres (o limite é em bytes: letras acentuadas contam como 2);
- A confirmação de senha deve ser igual ao campo de senha;
- E-mail em formato válido e único entre os usuários ativos (o servidor responde no campo se já existir).

---

## Alteração de Usuário

- A alteração deve seguir os mesmos campos de cadastro, exceto senha e confirmação de senha.

---

## Alteração de senha

- A senha só será alterada mediante a confirmação de senha.
- Campos obrigatórios.

---

## Inativação

- A inativação reflete o campo deletedAt, com confirmação. O usuário perde o acesso na hora.

## Reativação

- Limpa o deletedAt. Se o e-mail estiver em uso por outro usuário ativo, a API recusa e a tela mostra o motivo.

---

### Layout do dialog

- Ao clicar em Novo Usuário, usar dialog para realizar as operações de inclusão,
  alteração e alteração de senha.
  - Nome;
  - E-mail;
  - Tipo de usuário;
  - Senha;
  - Confirme sua senha;
