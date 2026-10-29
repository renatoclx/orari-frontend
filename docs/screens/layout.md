# Layout da área administrativa

## Sidebar

- No sidebar menu, a opção pessoas deverá contar com um dropdown contendo os tipos de pessoas
  que serão possíveis cadastrar. Sendo eles:
  - Clientes / Funcionários / Profissionais / Usuários
- Cada tipo de Pessoa irá referenciar um PeopleType no backend.
- Usuário é uma entidade separada, que possui referência diferente (UserType)
- Itens do menu, em ordem: Agendamentos, Recorrências, Pessoas (dropdown), Serviços, Turmas (só para o ADMIN), Pacotes (dropdown com Planos e Contratações) e Financeiro (dropdown com Comandas, Pagamentos e Métodos de pagamento) e, para quem acessa a anamnese, Anamnese (dropdown para o ADMIN com Fichas preenchidas, Modelos de ficha e Auditoria; para o profissional vinculado, só o item Fichas preenchidas) e, só para o SUPER_ADMIN, Empresas.
- Ordem do menu (sidebar): Agendamentos, Recorrências, Pessoas, Serviços, Turmas (só ADMIN), Pacotes e Financeiro (dropdowns: Pessoas, Pacotes e Financeiro).
- Configurações da empresa (`configuracoes.md`): acessadas pelo menu do usuário.

---

## Header

- À esquerda, o nome fantasia da empresa (só do tablet em diante; no celular, o espaço fica para o menu, a logo do Orari e os atalhos).
- À direita, a logo da empresa (quando houver), o nome e o tipo do usuário e o avatar.
- O menu do usuário (avatar) reúne: **Configurações da empresa**, **Tema escuro** (item com switch; alterna sem fechar o menu) e **Sair** (com confirmação). O tema deixou de ter botão próprio no header. Na tela de login o tema continua como switch.

---

## Barra de ações lateral

- As informações por entidade a serem adicionadas estarão destacadas com `Barra de Ações`
- Menu de acesso rápido que está posicionado a direita, sobre o layout principal, apenas com ícones.
  - Calendário (irá ter ação com a tela de Agendamentos);
  - Cliente (ícone para cadastro rápido de um cliente);
  - Serviços (ícone para cadastro rápido de um serviço);
  - Recorrência (ícone que abre o cadastro de uma nova recorrência);
  - Comandas (ícone de recibo; leva às comandas do dia, `/financeiro/comandas`);

No celular, somente o item calendário será exibido, os demais devem permanecer ocultos.
