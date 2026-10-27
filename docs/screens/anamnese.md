# Anamnese

> Ficha de saúde do cliente. É dado **sensível** (LGPD): o acesso é restrito, o backend criptografa as respostas e audita toda ação. Este documento é atualizado a cada etapa implementada. Plano das etapas: `prompts/anamnese-frontend.md`.

## Quem acessa

- **Fichas dos clientes:** o ADMIN e o usuário vinculado a um **profissional** ativo. Funcionário vinculado e usuário sem vínculo não acessam (a API responde 403).
- **Modelos de ficha e auditoria:** só o ADMIN.
- O SUPER_ADMIN só acessa fichas se estiver vinculado a um profissional da própria empresa.
- A regra de tela está em `utils/anamnesis-access.ts` (`anamnesisAccess`) e só esconde o que não vale; quem decide é a API.

## Menu (etapa A)

- Grupo **Anamnese** na barra lateral, depois de Financeiro, **só para o ADMIN**: Modelos de ficha (`/anamnese/modelos`) e Auditoria (`/anamnese/auditoria`).
- As fichas dos clientes não têm item no menu: ficam na aba "Anamnese" da página do cliente (etapa C), para o ADMIN e o profissional vinculado.

## Modelos de ficha (etapa B, só ADMIN)

Rotas: `/anamnese/modelos` (lista), `/anamnese/modelos/novo` e `/anamnese/modelos/[id]/editar`. Os demais perfis veem 404 (a API também recusa com 403).

### Listagem

- Colunas: Nome (com a **descrição na segunda linha**, menor), Perguntas (quantidade), Versão (a vigente), Status e Ações.
- Busca por nome e filtro de status, na URL, e paginação, como nas demais listagens.
- Ações: **Alterar** em destaque; no menu, **Visualizar** (dialog com as perguntas da versão vigente), **Inativar** (com confirmação) e **Ativar**. Não há exclusão.
- Inativar impede novas fichas; as fichas já existentes continuam acessíveis e recebendo acompanhamentos.

### Cadastro e alteração

- Campos: Nome (obrigatório, único na empresa, sem diferenciar acento nem maiúsculas; repetido volta como erro no campo), Descrição (opcional) e as **perguntas**.
- Cada pergunta: texto (até 400), tipo, obrigatória (padrão: não), texto de ajuda (até 500) e, conforme o tipo:
  - Escolha única e múltipla: 2 a 50 opções, sem repetir (ignora acento e maiúsculas), até 100 caracteres cada.
  - Sim ou não: texto de detalhe opcional (ex.: "Qual?"), que vale só quando a resposta é "sim".
  - Texto curto, texto longo, número, data e escala de 0 a 10: sem campo extra.
- De 1 a 100 perguntas. Trocar o tipo descarta o que o novo tipo não aceita.
- A ordem da lista é a ordem da ficha; a numeração é automática. O corpo enviado **não leva `id` nem `position`** (a API recusa campos desconhecidos).
- A validação da tela espelha a da API (`template-validation.ts`, com testes); as mensagens da API continuam aparecendo.

### Versões (destaque técnico)

- Cada modelo tem **versões** numeradas. Criar o modelo cria a versão 1. **Mudar as perguntas** (texto, tipo, opções, ordem, incluir ou remover) cria uma **nova versão**; renomear, mudar a descrição ou inativar **não** cria.
- As fichas já abertas continuam presas à versão em que nasceram: editar o modelo só vale para as **próximas** fichas. A tela avisa isso na alteração, com o número da versão que será criada.
- Para não criar versões à toa, a alteração só envia `questions` quando elas realmente mudaram em relação à versão vigente (a Server Action relê o modelo na API e compara). Reenviar a mesma lista criaria uma versão igual.
- **Limite da API:** a descrição, uma vez preenchida, não pode ser apagada (só trocada por outro texto); a tela recusa deixá-la vazia na alteração.

### Reordenar por arrastar e soltar (destaque técnico)

- Biblioteca **`@dnd-kit`** (`core`, `sortable` e `utilities`): a lista de perguntas é uma lista "ordenável" e cada cartão tem uma **alça** (ícone de pontos) para arrastar.
- Funciona com **mouse** e **toque** (a alça tem `touch-action: none` e só começa a arrastar depois de 5 px, para não disparar ao clicar) e com **teclado**: foque a alça, `Espaço` levanta, as setas movem e `Espaço` solta (`Esc` cancela).
- Leitores de tela recebem avisos em **português** ("Pergunta 8 solta na posição 6"), configurados em `QuestionsEditor.tsx`.
- Cada pergunta e cada opção tem uma **chave estável** (só da tela, não vai para a API): ela mantém o foco e os erros certos ao reordenar e remover.

### Perguntas recolhíveis (accordion)

- Cada pergunta é um `Collapsible` (Radix): **recolhida**, vira uma linha com a alça, o número, o enunciado e um resumo (tipo, obrigatória, nº de opções); **aberta**, mostra os campos. Várias podem ficar abertas ao mesmo tempo. Assim a lista longa cabe na tela e fica fácil arrastar.
- A pergunta **nova nasce aberta** e recebe o foco; no cadastro, a primeira já vem aberta; na alteração, todas vêm recolhidas.
- O botão **Recolher todas / Expandir todas** aparece com mais de uma pergunta.
- **Validação:** o estado aberto/fechado fica no `TemplateForm` (só em memória). Ao enviar com erro, as perguntas com erro abrem sozinhas e o foco vai ao primeiro campo inválido; recolhida, a linha mostra "Revise esta pergunta".
- Os campos de uma pergunta recolhida saem do DOM, mas os valores continuam no estado do formulário, então nada se perde ao recolher.

## Regras de privacidade no frontend (valem em todas as etapas)

> Destaque técnico: estas regras protegem o dado de saúde e não podem ser quebradas por conveniência.

- **Nada de dado de saúde** em `localStorage`, `sessionStorage`, cookies, URL (query ou caminho), logs ou mensagens de erro. Ids de ficha e de cliente na URL são aceitáveis; respostas e evolução, não.
- **Sem cache:** as chamadas de anamnese usam `cache: "no-store"` (o `apiFetch` já faz isso) e as páginas são dinâmicas; nada de `"use cache"` nem ISR nessas rotas.
- **Rascunho só em memória:** ao sair da tela, o que foi digitado é descartado.
- **Erros:** mostram o texto da API (já em português), nunca o conteúdo da ficha.
- Os registros são **imutáveis**: nenhuma tela oferece editar ou excluir ficha ou acompanhamento; corrige-se com um novo acompanhamento.
