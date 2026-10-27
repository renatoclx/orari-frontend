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

## Fichas do cliente (aba "Anamnese")

> Etapa C entregue: **lista**, **ficha completa**, **acompanhamento** e **nova ficha**.

- A aba **Anamnese** fica na página do cliente (`/clientes/[id]?aba=anamnese`), depois de Pagamentos. Só aparece para quem tem acesso (ADMIN ou usuário vinculado a profissional, `anamnesisAccess`); sem acesso, `?aba=anamnese` cai em Agendamentos e a ficha nem é buscada.
- Lista (`GET /anamnesis?clientId=`): Modelo, Versão em que a ficha nasceu, Acompanhamentos e Última consulta. "Acompanhamentos" é `entriesCount - 1`, porque a API conta também o registro inicial.
- **Datas de consulta** chegam como data pura (`…T00:00:00.000Z`) e são exibidas em **UTC** (`formatDateOnly`); no fuso local apareceria o dia anterior.

### Ficha completa (`/clientes/[id]/anamnese/[fichaId]`)

- Abre pelo nome do modelo na lista. Duas colunas em tela larga (**Situação atual** à esquerda, **Evolução** à direita), empilhadas no celular.
- **Destaque técnico:** a ficha é desenhada com `version.questions` (a versão em que ela **nasceu**), nunca com a versão atual do modelo. É por isso que renomear ou reordenar perguntas do modelo não mexe nas fichas já preenchidas.
- **Situação atual:** a resposta mais recente de cada pergunta (`current`); sem resposta aparece "--". Respondida de novo num acompanhamento, mostra "atualizada em dd/mm/aaaa".
- **Evolução:** do registro mais recente para o mais antigo, com selo Inicial/Acompanhamento, data, autor (`authorProfessional` ou, se não houver, `authorUser`), texto da evolução e as respostas daquele registro (no acompanhamento, só as alteradas). O agendamento vinculado aparece só como "Vinculado a um agendamento".
- **Formato das respostas** (`answer-format.ts`, com testes): sim/não ("Sim: detalhe"), escolhas separadas por vírgula, data dd/mm/aaaa, escala "7 de 10", número pt-BR. Valor fora do formato esperado vira "--", sem exibir o valor cru.
- **404** quando a ficha não existe, é de outro cliente que o da URL ou o usuário não tem acesso (`requireAnamnesisAccess`).
- **Agendamento vinculado:** cada acompanhamento mostra qual agendamento é ("Massagem · 21/01/2027 às 14:30 · com Carol"). A API devolve só o `appointmentId`, então a página busca cada agendamento (`getAppointment`, sem repetir ids). Se um não puder ser lido, aparece "Agendamento indisponível", sem quebrar a página.
- Sem botões de editar ou excluir: a ficha e os acompanhamentos são imutáveis.

### Novo acompanhamento (`/clientes/[id]/anamnese/[fichaId]/acompanhamento`)

- Botão **"Novo acompanhamento"** na ficha completa; **some com o cliente inativo** (a API recusaria com 409) e a página responde 404 nesse caso.
- **Evolução do atendimento:** campo de texto grande, obrigatório, com contador (até 10.000 caracteres). É a anotação textual do profissional; fica no histórico da ficha.
- **Data da consulta** (padrão: hoje no fuso da empresa; não pode ser futura nem anterior ao registro inicial) e **Agendamento** opcional (todos os agendamentos do cliente, do mais recente ao mais antigo).
- **Atualizar respostas da ficha** (seção recolhida, opcional): cada pergunta vem preenchida com a resposta atual. **Destaque técnico:** só as respostas que **mudaram** vão no envio (`changedAnswers`); campo vazio nunca vai como `null` e uma resposta já dada **não pode ser apagada**, só atualizada.
- **Um campo por tipo** (`AnswerField`, reaproveitado na nova ficha): texto curto e longo, sim/não (botões, com campo de detalhe quando a pergunta pede), escolha única (rádio), múltipla (caixas), número (aceita vírgula), data e escala 0–10 (botões).
- A conversão tela → API e a validação ficam em funções puras testadas (`answer-form.ts`, `entry-validation.ts`), fora dos componentes.
- Server Action `createEntryAction`: confere o acesso e o texto da evolução, mostra o erro da API como veio e atualiza a ficha (`revalidatePath`). O rascunho fica só em memória.

### Fichas preenchidas (`/anamnese/fichas`)

- Tela de entrada das fichas, no menu **Anamnese** (o ADMIN a vê no grupo; o **profissional vinculado**, que só tem esse item, o vê direto). Lista os **clientes que já têm ficha**: Cliente, quantidade de **Fichas**, **Status** (ativo ou inativo, que continua legível) e a ação de ver as fichas. Tem busca por nome (sem acento nem maiúscula) e paginação; o botão **Nova ficha** fica no topo.
- **Destaque técnico:** a API não tem listagem geral de fichas (`GET /anamnesis` exige o cliente). A tabela usa `GET /anamnesis/clients`, que devolve nome e contagem numa chamada só e grava **uma** auditoria; contar cliente a cliente geraria uma auditoria por linha só de abrir a tela.
- **Dialog "Fichas de {cliente}":** abre pela ação da linha e busca as fichas do cliente só nesse momento (Server Action). Mostra modelo, versão, acompanhamentos e última consulta, com **Abrir** em cada uma (é na ficha aberta que se usa **Novo acompanhamento**; a ficha preenchida não é editada). O botão **Nova ficha** (cliente ativo) leva ao formulário com o cliente já escolhido.

### Nova ficha (`/anamnese/fichas/nova`)

- **Duas entradas, uma tela:** o botão **Nova ficha** da tela **Fichas preenchidas** (e do dialog dela), em que se escolhe o cliente, e o botão **Nova ficha** da aba Anamnese do cliente (some com cliente inativo), que chega com o cliente já escolhido (`?clienteId=`, só o id na URL). Assim ninguém precisa abrir o cliente, a aba e só então lançar a ficha.
- **Cliente:** seletor com busca no servidor (`useClientSearch`, os mesmos clientes ativos do agendamento). Escolher leva à mesma página com o cliente na URL; `?clienteId=` inválido é 404 e cliente inativo mostra o aviso.
- **Modelo:** só os modelos **ativos** que o cliente **ainda não usou** (uma ficha por cliente e modelo). Com um só, já vem escolhido. Sem nenhum disponível, a tela explica o motivo: **o cliente já tem ficha de todos os modelos ativos** (com o caminho para abrir a ficha e usar Novo acompanhamento e o botão "Ver fichas do cliente") ou **não há modelo ativo** na empresa (o ADMIN ganha o link para os Modelos). **Trocar o modelo descarta as respostas digitadas**, porque as perguntas mudam.
- **Data da consulta:** hoje no fuso da empresa; pode ser passada, nunca futura (`validateConsultationDate`, compartilhada com o acompanhamento).
- **Perguntas:** as da versão vigente do modelo, com o mesmo `AnswerField` do acompanhamento (os 8 tipos), agora com `*` nas obrigatórias. **Destaque técnico:** `buildNewAnswers` envia as respondidas, **omite a opcional vazia** (nunca `null`) e acusa a obrigatória vazia no campo; o foco vai ao primeiro erro.
- Ao criar, abre a ficha completa. Erros da API (409, 400) aparecem como vieram; o rascunho fica só em memória.

### Atalho a partir do agendamento

- **Atalho:** o dialog de detalhes do agendamento (agenda, histórico do cliente e financeiro) tem o botão **Anamnese**, que abre a aba de fichas do cliente. Só aparece para quem tem acesso; o acesso chega por um contexto (`AnamnesisAccessProvider`, no `AdminShell`), sem repassar prop pelas três telas.

## Regras de privacidade no frontend (valem em todas as etapas)

> Destaque técnico: estas regras protegem o dado de saúde e não podem ser quebradas por conveniência.

- **Nada de dado de saúde** em `localStorage`, `sessionStorage`, cookies, URL (query ou caminho), logs ou mensagens de erro. Ids de ficha e de cliente na URL são aceitáveis; respostas e evolução, não.
- **Sem cache:** as chamadas de anamnese usam `cache: "no-store"` (o `apiFetch` já faz isso) e as páginas são dinâmicas; nada de `"use cache"` nem ISR nessas rotas.
- **Rascunho só em memória:** ao sair da tela, o que foi digitado é descartado.
- **Erros:** mostram o texto da API (já em português), nunca o conteúdo da ficha.
- Os registros são **imutáveis**: nenhuma tela oferece editar ou excluir ficha ou acompanhamento; corrige-se com um novo acompanhamento.
