# Layout da área administrativa

## Sidebar

- No sidebar menu, a opção pessoas deverá contar com um dropdown contendo os tipos de pessoas
  que serão possíveis cadastrar. Sendo eles:
  - Clientes / Funcionários / Profissionais / Usuários
- Cada tipo de Pessoa irá referenciar um PeopleType no backend.
- Usuário é uma entidade separada, que possui referência diferente (UserType)
- Itens do menu, em ordem: Agendamentos, Recorrências, Pessoas (dropdown), Serviços, Pacotes (dropdown com Planos e Contratações) e Financeiro (dropdown com Pagamentos e Métodos de pagamento).
- Configurações da empresa: área própria (logo, nome fantasia, horários de funcionamento e dados cadastrais só para leitura). O ponto de acesso ainda será definido.

---

## Barra de ações lateral

- As informações por entidade a serem adicionadas estarão destacadas com `Barra de Ações`
- Menu de acesso rápido que está posicionado a direita, sobre o layout principal, apenas com ícones.
  - Calendário (irá ter ação com a tela de Agendamentos);
  - Cliente (ícone para cadastro rápido de um cliente);
  - Serviços (ícone para cadastro rápido de um serviço);
  - Recorrência (ícone que abre o cadastro de uma nova recorrência);

No celular, somente o item calendário será exibido, os demais devem permanecer ocultos.
