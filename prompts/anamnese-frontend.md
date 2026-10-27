# Anamnese: telas e integração com a API

O backend da **anamnese** (ficha de saúde do cliente) está pronto. Este trabalho constrói as telas no frontend e liga à API. Siga o CLAUDE.md do projeto (analisar, explicar o plano, aguardar aprovação, só então alterar) e **não faça commit nem push sem eu pedir**. Trabalhe em uma branch nova (por exemplo `feature/anamnese`) e em etapas, relatando ao fim de cada uma.

## Contexto

- É dado de **saúde** (sensível pela LGPD). O backend criptografa as respostas e audita todo acesso. O frontend não deve deixar rastro desses dados (ver "Privacidade no frontend").
- O backend está na branch `feature/anamnese-vinculo-auditoria` (ainda sem PR). Para testar localmente: backend nessa branch, `npx prisma migrate deploy`, e `ANAMNESIS_ENCRYPTION_KEY` no `.env` do backend (na minha máquina já está).
- Quem acessa a anamnese: o **ADMIN** e o usuário **vinculado a um profissional ativo**. Os demais recebem 403. O SUPER_ADMIN não acessa fichas de ninguém.
- Só o **ADMIN** cria, edita e inativa **modelos** de ficha. Os profissionais consultam os modelos e preenchem fichas.
- Os registros são **imutáveis**: não existe editar nem excluir uma ficha ou um acompanhamento. Corrige-se com um novo acompanhamento. Nenhuma tela deve oferecer "editar" ou "excluir" registro.

## Etapas sugeridas

1. **Vínculo usuário × profissional** e menu.
2. **Modelos de ficha** (ADMIN).
3. **Fichas do cliente**: nova ficha, ficha completa, acompanhamento.
4. **Impressão do PDF**.
5. **Consulta à auditoria** (ADMIN).

## 1. Vínculo usuário × pessoa e menu (vínculo FEITO; menu na etapa A)

**Já implementado (não refazer):** o vínculo está na tela de Usuários (PR #19 e #20, na `main`), e o backend já aceita profissional **ou funcionário** (`docs/screens/usuarios.md`).

- No cadastro e na edição de usuário há o campo **Função** (Nenhuma, Profissional ou Funcionário) e a seleção da pessoa. `POST /users` e `PATCH /users/:id` aceitam `peopleId` (`null` desfaz). A listagem traz a coluna **Função**, com o cargo da pessoa em badge. O 409 de pessoa já vinculada aparece no campo. Não há "Cadastrar novo profissional" no formulário de usuário (o cadastro de pessoas é em Pessoas).
- **Só o vínculo com profissional** dá acesso à anamnese. O vínculo com funcionário não dá.
- `GET /auth/me` devolve `professional: { id, name } | null` (profissional vinculado **ativo**; funcionário ou inativo vem `null`) e `person: { id, name, type, profession } | null` (a pessoa vinculada, profissional ou funcionário). O tipo `CurrentUser` já tem os dois campos.
- **Acesso à anamnese** (`utils/anamnesis-access.ts`): `canAccess` = ADMIN ou `professional !== null` (fichas dos clientes); `isAdmin` = só o ADMIN (modelos e auditoria). O SUPER_ADMIN só acessa se estiver vinculado a um profissional.
- **Menu (etapa A):** o grupo **Anamnese** (Modelos de ficha e Auditoria) aparece só para o ADMIN. As fichas ficam na aba "Anamnese" da página do cliente (ADMIN e profissional vinculado), então o profissional não tem item no menu.

## 2. Modelos de ficha (ADMIN)

Rotas (`/anamnesis-templates`): `POST`, `GET` (`?name`, `?isActive`, `?page`, `?limit`), `GET /:id`, `PATCH /:id`. Não há exclusão: o modelo é **inativado** (`isActive: false`) e pode ser reativado.

**Criar** (`POST`):

```json
{
  "name": "Fisioterapia",
  "description": "Ficha inicial",
  "questions": [
    {
      "label": "Tem alergia?",
      "type": "YES_NO",
      "isRequired": true,
      "detailLabel": "Qual?",
      "helpText": "Inclui medicamentos"
    },
    { "label": "Nível de dor", "type": "SCALE" },
    {
      "label": "Esportes",
      "type": "MULTIPLE_CHOICE",
      "options": ["Corrida", "Natação"]
    }
  ]
}
```

**Resposta** (criar, ler e editar têm o mesmo formato):

```json
{
  "id": "…",
  "companyId": "…",
  "name": "Fisioterapia",
  "description": "Ficha inicial",
  "isActive": true,
  "createdAt": "…",
  "updatedAt": null,
  "currentVersion": {
    "id": "…",
    "version": 1,
    "createdAt": "…",
    "questions": [
      {
        "id": "…",
        "position": 1,
        "label": "Tem alergia?",
        "helpText": "Inclui medicamentos",
        "type": "YES_NO",
        "isRequired": true,
        "options": [],
        "detailLabel": "Qual?"
      }
    ]
  }
}
```

A listagem é paginada (`{ items, total, page, limit }`), cada item no mesmo formato.

**Editar** (`PATCH /:id`): `name`, `description`, `isActive` e `questions`, todos opcionais.

- Enviar `questions` **cria uma nova versão** (a lista enviada substitui a anterior; reenviar a mesma lista também cria uma versão nova). Renomear, mudar a descrição e inativar **não** criam versão.
- As fichas já abertas continuam presas à versão em que nasceram. Avise isso na tela de edição ("Editar as perguntas vale para as próximas fichas; as já preenchidas não mudam").
- Ao editar, carregue `GET /:id`, preencha o editor com `currentVersion.questions` e envie a lista completa de volta.

**Tipos de pergunta e regras (validadas pela API, espelhe no formulário):**

| `type`                                                        | Opções                                                  | Detalhe (`detailLabel`)                                    |
| ------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| `SHORT_TEXT`, `LONG_TEXT`, `NUMBER`, `DATE`, `SCALE` (0 a 10) | não aceita                                              | não aceita                                                 |
| `YES_NO`                                                      | não aceita                                              | opcional (ex.: "Qual?"; vale só quando a resposta é "sim") |
| `SINGLE_CHOICE`, `MULTIPLE_CHOICE`                            | **2 ou mais**, sem repetir (ignora acento e maiúsculas) | não aceita                                                 |

Limites: de 1 a 100 perguntas; `label` até **400** caracteres; `helpText` até 500; cada opção até 100 (no máximo 50 opções); `isRequired` opcional (padrão: não obrigatória). O nome do modelo é único na empresa (sem diferenciar acento nem maiúsculas): `409` se repetir.

**A ordem é a da lista enviada.** O editor deve permitir **arrastar e soltar** as perguntas para reordenar, e o frontend envia o array na ordem final. **Não envie `position` nem `id`** de pergunta (a API recusa campos desconhecidos com 400). Mensagens de validação vêm em português, citando a pergunta ("Pergunta 2: informe ao menos 2 opções"): mostre-as.

## 3. Fichas do cliente

Na tela do cliente, uma aba **"Anamnese"** (só para quem tem acesso). Existe **uma ficha por cliente e por modelo**.

### Listar as fichas do cliente

`GET /anamnesis?clientId=<uuid>` (o `clientId` é obrigatório; não há listagem geral):

```json
{
  "items": [
    {
      "id": "…",
      "createdAt": "…",
      "template": { "id": "…", "name": "Fisioterapia" },
      "templateVersion": 2,
      "entriesCount": 3,
      "lastConsultationDate": "2026-10-25T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### Nova ficha

`POST /anamnesis`:

```json
{
  "clientId": "…",
  "templateId": "…",
  "consultationDate": "2026-10-20",
  "answers": [
    { "questionId": "…", "value": { "answer": true, "detail": "Dipirona" } },
    { "questionId": "…", "value": 7 }
  ]
}
```

- O formulário é montado com as perguntas **da versão vigente do modelo**: use `currentVersion.questions` do `GET /anamnesis-templates/:id`. Liste em "Nova ficha" só modelos **ativos** e que o cliente **ainda não usou** (já existe ficha dele → `409`). Cliente precisa estar ativo.
- `consultationDate` é opcional (formato `AAAA-MM-DD`): o padrão é hoje no fuso da empresa (`company.timezone` do `/auth/me`). Pode ser passada (para lançar algo esquecido), **nunca futura**.
- Pergunta obrigatória sem resposta → `400`. Pergunta **opcional sem resposta: simplesmente não envie** a chave no array (não envie `null`).

**Formato do `value` por tipo** (a resposta é guardada nesse formato):

| `type`                    | `value`                                                                                                            | Exemplo                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| `SHORT_TEXT`, `LONG_TEXT` | texto não vazio, até 5.000 caracteres                                                                              | `"Dor lombar"`                             |
| `YES_NO`                  | `{ "answer": boolean, "detail"?: texto }`. O `detail` só se a pergunta tem `detailLabel` **e** a resposta é `true` | `{ "answer": true, "detail": "Dipirona" }` |
| `SINGLE_CHOICE`           | uma das `options`                                                                                                  | `"Casado(a)"`                              |
| `MULTIPLE_CHOICE`         | lista não vazia de `options`, sem repetir                                                                          | `["Corrida", "Natação"]`                   |
| `NUMBER`                  | número                                                                                                             | `68.5`                                     |
| `DATE`                    | texto `AAAA-MM-DD`                                                                                                 | `"2019-03-14"`                             |
| `SCALE`                   | inteiro de 0 a 10                                                                                                  | `7`                                        |

### Ficha completa

`GET /anamnesis/:id` (e também o retorno de `POST /anamnesis` e de `POST /anamnesis/:id/entries`):

```json
{
  "id": "…",
  "createdAt": "…",
  "client": { "id": "…", "name": "Joana" },
  "template": { "id": "…", "name": "Fisioterapia" },
  "version": {
    "id": "…",
    "version": 2,
    "questions": [
      {
        "id": "…",
        "position": 1,
        "label": "…",
        "helpText": null,
        "type": "SCALE",
        "isRequired": false,
        "options": [],
        "detailLabel": null
      }
    ]
  },
  "current": [
    {
      "questionId": "…",
      "value": 2,
      "entryId": "…",
      "consultationDate": "2026-10-25T00:00:00.000Z"
    }
  ],
  "entries": [
    {
      "id": "…",
      "kind": "INITIAL",
      "consultationDate": "2026-10-20T00:00:00.000Z",
      "appointmentId": null,
      "evolution": null,
      "authorUser": { "id": "…", "name": "Admin" },
      "authorProfessional": { "id": "…", "name": "Dra. Paula" },
      "createdAt": "…",
      "answers": [{ "questionId": "…", "value": 7 }]
    },
    {
      "id": "…",
      "kind": "FOLLOW_UP",
      "consultationDate": "2026-10-25T00:00:00.000Z",
      "appointmentId": null,
      "evolution": "Melhorou após as sessões",
      "authorUser": { "id": "…", "name": "Admin" },
      "authorProfessional": null,
      "createdAt": "…",
      "answers": [{ "questionId": "…", "value": 2 }]
    }
  ]
}
```

- `version.questions` são as perguntas **desta ficha** (a versão em que ela nasceu). **Renderize a ficha com elas, nunca com a versão atual do modelo.**
- `current` é a situação atual: a resposta mais recente de cada pergunta. Pergunta que nunca foi respondida não aparece em `current`.
- `entries` está em ordem de data (do registro inicial ao último acompanhamento). `authorProfessional` é `null` quando quem registrou não tem vínculo: mostre `authorUser.name`.
- **Datas de consulta** (`consultationDate`) chegam como `…T00:00:00.000Z` (data pura). **Exiba só a data, lendo em UTC** (por exemplo `new Date(x).toISOString().slice(0, 10)`). Converter para o fuso local mostraria o dia anterior.
- Layout sugerido: cabeçalho (cliente, modelo e versão), a **situação atual** por pergunta e uma **linha do tempo** do histórico. Formate as respostas por tipo (sim/não com detalhe, lista de opções, data dd/mm/aaaa, escala "7 de 10").

### Acompanhamento

`POST /anamnesis/:id/entries`:

```json
{
  "evolution": "Melhorou após as sessões",
  "consultationDate": "2026-10-25",
  "appointmentId": "…",
  "answers": [{ "questionId": "…", "value": 2 }]
}
```

- `evolution` é obrigatória (até 10.000 caracteres). `consultationDate`: padrão hoje; não pode ser futura **nem anterior à data do registro inicial** da ficha. `appointmentId` é opcional: deve ser um agendamento **do mesmo cliente** (ofereça os agendamentos dele para escolher).
- `answers` é opcional e traz **só as perguntas cuja resposta mudou**. O formulário mostra as respostas atuais (`current`) e deixa alterar; envie apenas as alteradas. **Não há como apagar uma resposta já dada**; só atualizar.
- Cliente **inativo**: a ficha continua legível, mas não aceita acompanhamento (`409`): esconda o botão.
- O histórico é o **controle do profissional**: é anotado conforme a evolução do cliente. A ficha inicial não é reescrita.

## 4. Impressão do PDF

`GET /anamnesis/:id/pdf?includeHistory=true|false` (padrão `true`) devolve `application/pdf` (`inline`, `Cache-Control: no-store`), gerado no backend.

- O PDF tem duas partes: a **ficha** (respostas do registro inicial, assinatura **só do cliente**) e o **histórico** (página própria, sem assinatura). Com `includeHistory=false` sai só a ficha, para a via do cliente. Ofereça a opção: **"Incluir histórico de acompanhamento"** (marcada por padrão).
- A rota exige o token no cabeçalho `Authorization`, então **um link direto não funciona**. Faça a busca no servidor do Next (route handler seguindo a arquitetura do projeto, com o token do cookie httpOnly e a renovação de sessão já existente) e devolva os **bytes** do PDF ao navegador com `Content-Type: application/pdf` e `Cache-Control: no-store` (não é JSON: não passe pelo parser de JSON). Abra em nova aba, ou em um visualizador com o botão "Imprimir". A impressão é do navegador.
- Mostre um estado de carregamento (a geração leva um instante) e trate erros (`403`, `404`) com mensagem clara.

## 5. Consulta à auditoria (ADMIN)

`GET /audit-logs` (só ADMIN, só a própria empresa; SUPER_ADMIN recebe 403). Filtros opcionais: `clientId`, `userId`, `action`, `from`, `to` (datas e horas ISO completas, ex.: `2026-10-27T00:00:00-03:00`) e `page`/`limit`. Ordem: mais recente primeiro.

```json
{
  "items": [
    {
      "id": "…",
      "companyId": "…",
      "userId": "…",
      "action": "ANAMNESIS_VIEWED",
      "entityType": "ANAMNESIS",
      "entityId": "…",
      "clientId": "…",
      "ip": "::ffff:10.0.0.1",
      "createdAt": "2026-10-27T13:29:45.540Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

- `action`: `USER_LINK_CHANGED`, `ANAMNESIS_TEMPLATE_CREATED`, `ANAMNESIS_TEMPLATE_UPDATED`, `ANAMNESIS_VIEWED` (ficha lida), `ANAMNESIS_LISTED` (lista de fichas de um cliente), `ANAMNESIS_ENTRY_CREATED` (ficha ou acompanhamento criado) e `ANAMNESIS_PDF_GENERATED`. Mostre rótulos em português.
- A resposta traz só os ids. Para exibir **nomes**, resolva o usuário (`GET /users`, que o ADMIN pode listar) e o cliente (`GET /people/:id`), com cache de curta duração na própria tela. Se isso ficar pesado, avise: dá para o backend devolver os nomes.
- Só leitura: não há editar nem excluir.

## Privacidade no frontend

- **Nada de dado de saúde** em `localStorage`/`sessionStorage`, cookies, URLs (query string ou caminho), logs, analytics ou mensagens de erro. Ids em URL (de ficha e de cliente) são aceitáveis; respostas e evolução, não.
- As chamadas de anamnese **não podem ser cacheadas**: busque no servidor com `cache: "no-store"` e renderização dinâmica (nada de `"use cache"`/ISR nessas rotas).
- Rascunho de formulário só em memória: ao sair da tela, descarte.
- Mensagens de erro mostram o texto da API (já em português), nunca o corpo da ficha.

## Verificação

- Testes (vitest) dos serviços e componentes novos, conforme o padrão do projeto, rodando só o que for alterado, mais `typecheck` e `lint`.
- Teste de verdade contra o backend local: crie um modelo com todos os tipos de pergunta, abra uma ficha, faça acompanhamentos, gere o PDF (com e sem histórico) e confira os perfis: ADMIN, usuário vinculado a profissional, usuário sem vínculo (menu oculto e 403 se forçar a URL) e outra empresa (404).
- Atenção aos limites de tentativas do login da API (5 por minuto por IP) ao testar com vários perfis.

## Ao final de cada etapa, devolva

Os arquivos criados e alterados, o resumo, os impactos, o que você testou (e como), e os próximos passos. Se achar uma abordagem melhor ou encontrar uma divergência com a API, **avise antes de implementar**.
