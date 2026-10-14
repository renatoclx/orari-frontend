# Padrões de Telas

### Objetivo

Definir os padrões visuais e comportamentais das telas da aplicação.
Todas as implementações de interface deverão seguir estes padrões, salvo
quando a documentação da entidade definir comportamento diferente.
Em caso de conflito entre este documento e a documentação de uma entidade
específica, prevalece a documentação da entidade.

## Telas de listagem

- Título
- Campo de pesquisa com atualização da listagem durante a digitação.
- Botão Novo relacionado a entidade.
- Exibição de tabela com itens já registrados.
- Paginação.
- Toda entidade deverá possuir uma opção de acesso no menu lateral
  acompanhada de um ícone representativo.

---

## Feedback visual

- As notificações devem aparecer no rodapé centralizado em dispositivos
  móveis.
- Em telas maiores, as notificações devem aparecer no canto superior
  direito.
- Ao executar uma requisição, sempre notificar o usuário.

## Loading

- Utilizar skeletons com animação durante o carregamento inicial das páginas.
- Utilizar loaders dentro dos botões de ação para melhor experiência de
  usuário.

---

## Tabelas

- Os itens exibidos em cada tabela serão descritos por entidade e
  deverão ser respeitados.
- Todas as tabelas deverão contar com uma coluna chamada "Ações", situada
  sempre na última coluna.
- Nesta coluna deverá ter os botões para interação com o item da tabela
  em questão.
- Os nomes das colunas deverão permanecer consistentes entre todas as
  telas.
- A ordem dos botões deverá permanecer consistente em todas as
  entidades.
- Quando não existir a informação de uma coluna, preencher com "--".

---

## Coluna Ações

- Botões com ações exclusivas e/ou adicionais serão informados nas
  entidades relacionadas.
- Botões que não deverão estar presentes em entidades específicas serão
  informados nas entidades relacionadas.
- Botões padrão:
  - Visualizar
  - Alterar
  - Excluir
- A ordem deverá ser mantida em todas as entidades.
- Quando a entidade possuir mais de uma ação: a ação "Alterar" fica destacada
  como ícone próprio na coluna; as demais ações (Visualizar, Excluir, etc.)
  ficam agrupadas em um menu acionado por um ícone de kebab ("⋮"), mantendo a
  ordem padrão entre si.
- Quando a entidade possuir apenas uma ação (ex.: Excluir em Categoria), essa
  ação aparece sozinha na coluna, sem menu.
- Todos os botões da coluna Ações (destacado, kebab e ação única) usam estilo
  neutro (ícone-only, sem cor por ação) — não há mais distinção de cor entre
  Visualizar/Alterar/Excluir nessa coluna.

---

## Badges

- Todas as badges exibidas na aplicação devem seguir um padrão básico.
  - Cor correspondente a informação (Ex. Verde para ativo).
  - Texto interno pesado e em caixa alta.

---

## Telas de Cadastros

Todas as telas de cadastro deverão possuir:

- Título.
- Subtítulo com pequena descrição da função da página.
- Validação dos campos obrigatórios.
- Exibir feedback de sucesso ou erro após a operação.
- Exibir dialog para confirmação o cadastro de uma entidade.

---

## Telas de Alteração

Todas as telas de alteração deverão possuir:

- Layout baseado na tela de cadastro.
- Título.
- Subtítulo com pequena descrição da função da página.

- Validação dos campos obrigatórios.
- Exibir feedback de sucesso ou erro após a operação.

---

## Dialog de Visualização

Ao solicitar uma visualização:

- Abrir dialog de visualização.
- Exibirá as informações da entidade e do item selecionado.
- Botão Fechar para encerrar a visualização.

---

## Dialog de Exclusão

Ao solicitar uma exclusão:

- Abrir dialog de confirmação.
- Exibir claramente qual registro será removido.
- Exibir mensagem de exclusão com o nome da entidade.
- Permitir cancelar.
- Executar a operação somente após confirmação.

---

## Dialog de Formulário

Ao solicitar uma exclusão:

- Abrir dialog de formulário.
- Exibir as informações que serão cadastradas conforme `screens.md`.
- Permitir cancelar.
- Os botões que persistem as cadastros, alterações, etc., devem estar no rodapé da div que contém o formulário,
  separados por uma borda no topo e alinhados a direita.

---

## Formulários

Ao abrir um formulário de cadastro:

- Verificar se a tela em `screens.md` possui algum diferencial
- Os botões que persistem as cadastros, alterações, etc., devem estar no rodapé da div que contém o formulário,
  separados por uma borda no topo e alinhados a direita.
- Os campos de data serão sempre do tipo Date com calendário.
- Campo de Observações com no mínimo 04 linhas.
