# Dívida técnica (Frontend)

Pontos conhecidos e aceitos por enquanto. Revisar quando o contexto mudar.

## Autenticação

- **Renovação compartilhada por instância.** No proxy, requisições simultâneas compartilham uma renovação guardada em memória. Com várias instâncias do frontend, cada uma teria a sua, e a rotação poderia recusar uma delas (o usuário seria deslogado). Hoje há uma instância só.
- **Mensagem do 401 em inglês.** O backend responde "Unauthorized"; não aparece na tela (o 401 leva ao login), mas não é traduzida.

## Telas

- **Empresa sem nenhuma janela cadastrada.** A API não restringe horários nem há encaixe; a agenda trata o dia sem janela como "somente encaixe" (o agendamento comum fica sem horários).
- **Conflito do cliente.** Os horários oferecidos só consideram os agendamentos do profissional; se o cliente já tiver agendamento no horário, o servidor recusa (409) e a tela informa.
- **Disponibilidade calculada no frontend.** As regras de horário (janela, conflito, passado) são repetidas na tela; a API é quem decide ao salvar. Se divergirem, o servidor vence. Uma rota de disponibilidade no backend centralizaria as regras.
- **Busca de clientes e serviços.** Clientes: busca no servidor (20 por vez). Serviços: até 100 ativos, filtrados na tela.
- **Profissionais da agenda.** A grade carrega até 100 profissionais (uma página). Acima disso, os demais não aparecem.
- **Pausas por profissional.** O backend só tem o horário de funcionamento da empresa; a agenda não desenha pausas (previsto: o administrador poderá lançá-las).
- **Posição inicial da grade.** No celular a grade abre no início da faixa (2 h antes do expediente); falta rolar até o primeiro agendamento ou até o horário atual.
- **Nomes de profissional fora da lista.** Agendamentos de profissionais inativos não aparecem (a agenda deles será remanejada, fora do MVP).

## Recorrências

- **Disponibilidade do período calculada no frontend.** A tela busca de uma vez os agendamentos do profissional e do cliente no período e cruza as datas no navegador. Num período longo (12 meses) são várias páginas da API. Uma rota de disponibilidade no backend centralizaria as regras.
- **Recorrências de pacote na lista.** A API não filtra por pacote; elas aparecem, sem a ação de cancelar.
- **Ordem da lista.** A API ordena pela data inicial crescente: as mais novas ficam nas últimas páginas.
- **Busca de clientes duplicada.** `useClientSearch` (recorrência) e o dialog de novo agendamento têm a mesma lógica; unificar quando o dialog for revisto.
- **Remanejar pela agenda busca a recorrência ao abrir** (a resposta do agendamento não traz o período). O dialog aparece depois dessa busca.

## Pacotes

- **Prévia dos valores no frontend.** `plan-pricing.ts` repete o cálculo do backend (arredondamento e parcelas) só para exibir; o servidor calcula e congela na contratação. Se as regras mudarem, mudar nos dois lados.
- **Parcelas por contratação.** Os detalhes buscam todas as páginas de `GET /payments?clientPlanId=`; a baixa é feita no Financeiro (Pagamentos e Comandas).
- **Cliente filtrado na listagem de contratações.** Se o cliente do filtro não estiver entre os primeiros 100, o nome é buscado à parte (`GET /people/:id`).
- **Inputs escondidos do Radix.** Switch e Select dentro de um form criam inputs absolutos; o contêiner com rolagem dos formulários de contratação, recorrência, plano e pessoa é `relative` para eles não aumentarem a altura da página.

## Configurações da empresa

- **Gravação em etapas.** Nome fantasia, logo e cada janela de horário usam chamadas separadas. Se uma falhar no meio, o que veio antes já foi gravado; a mensagem diz qual parte falhou e a tela recarrega o que ficou salvo. Uma rota que gravasse a semana inteira de uma vez (como o `batch`, mas substituindo) evitaria isso.
- **Dias da semana.** A lista `WEEK_DAYS` (usada também na recorrência) está em `components/recurrences/`; mover para `utils/` quando um terceiro módulo precisar.
- **Dados cadastrais só leitura.** Razão social, documento (CPF ou CNPJ), fuso e demais dados só o SUPER_ADMIN altera (sem tela no frontend).

## Pessoas

- **Foto fora da transação.** No cadastro, a pessoa é criada e a foto enviada depois, por rota própria. Se a foto falhar, a pessoa já existe (o usuário é avisado e pode enviar na alteração). Idem para o contato principal e a foto na alteração: falhas após o `PATCH` da pessoa viram avisos.
- **Contatos e endereços na alteração valem na hora.** Adicionar e excluir não esperam o "Salvar alterações" (a API os mantém em rotas próprias). Cancelar a tela não desfaz o que já foi adicionado ou excluído.
- **Cidade dos endereços.** `GET /addresses` devolve só `cityId`; a tela de alteração busca cada cidade (`GET /cities/:id`) para exibir nome e UF. Se o backend passar a devolver cidade e estado, eliminar essas buscas.
- **Reescrita de `/uploads`.** Depende de `API_URL` definida na hora do build/início do servidor; sem ela, as fotos não aparecem.
- **Histórico do cliente.** Cada aba faz a sua busca e o cabeçalho faz cinco consultas de contagem (próximo agendamento, concluídos, pacotes ativos, cancelamentos e faltas). Uma rota de resumo no backend as reuniria.

## Financeiro

- **Parcelamento no cartão não existe.** A baixa registra método, valor e data; número de parcelas, taxas, valor líquido e data de repasse da operadora ficam para a conciliação (decisão de 2026-10-22). O método de pagamento é só um nome: não há tipo para saber qual é crédito.
- **A comanda não acompanha a virada do dia.** O dia é o que a API devolveu ao carregar; com a tela aberta na meia-noite, só ao recarregar.
- **Baixa em lote de um cliente por vez.** A API exige o mesmo cliente nos pagamentos; a tela desabilita a seleção dos outros. Não há "marcar todos".
- **Listas de apoio até 100.** Métodos de pagamento e os primeiros clientes do filtro vêm numa página só (100). O cliente filtrado fora dos primeiros é buscado à parte (`GET /people/:id`), como nas contratações.
- **Data passada da baixa ao meio-dia.** A tela envia o meio-dia do fuso da empresa, não a hora real; o horário do pagamento lançado depois não é preciso.
- **Busca de clientes do filtro duplicada.** Pagamentos e Contratações usam `useClientSearch`, que ainda tem a mesma lógica do dialog de novo agendamento.
- **Resumo e lista em chamadas separadas.** Os totais (`/payments/summary`) e a lista (`/payments`) são duas consultas; se um pagamento mudar entre elas, os números podem divergir até a próxima carga.
- **Pagamento sem cobrança própria na comanda.** Sessões de pacote aparecem como "Incluído no pacote", e o avulso ainda não concluído, como "Aguardando conclusão"; receber antes de concluir (sinal) não existe.

## Deploy

- **`API_URL` é lida no build para `/uploads`.** O `next.config.ts` grava o destino da reescrita no `next build`; trocar a `API_URL` só em tempo de execução não muda esse destino. Mudou o endereço da API: construir a imagem de novo.
- **Uma instância só.** A renovação compartilhada do proxy (`refreshesInFlight`) vive na memória do processo. Com mais de uma instância do frontend, cada uma teria a sua e a rotação do refresh token poderia deslogar o usuário (já listado em Autenticação). O cache do Next e o resto também não são compartilhados.
- **Nova versão invalida as páginas abertas.** Cada build gera chaves próprias das Server Actions: quem estava com a tela aberta durante um deploy vê erro na próxima ação até recarregar. Fixar `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` (e um identificador de deploy) resolveria; não é necessário com uma instância e poucos usuários.
- **A porta 3000 não pode ser exposta.** O repasse do IP confia no Caddy para sobrescrever o `x-forwarded-for`; com o Next exposto direto, qualquer cliente forjaria o IP e escaparia do limite de tentativas da API. No Compose a porta fica só na rede interna.
- **Fotos e logos passam pelo Next.** `/uploads` é uma reescrita servida pelo processo Node; o Caddy poderia servir esses arquivos direto da API.
- **O healthcheck não testa a API.** `/login` é renderizada sem chamar a API, então o contêiner fica "saudável" mesmo com a API fora do ar (as telas autenticadas mostram o erro de conexão).
- **Sem otimização de imagem.** Sem `sharp` na imagem: `next/image` só com SVG e `unoptimized`. Imagens raster otimizadas exigiriam instalá-lo.
- **Cabeçalhos de segurança do site (melhoria pendente, 2026-10-23).** Em produção o site devolve só `X-Powered-By: Next.js`: faltam `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options` (ou `frame-ancestors`) e `Referrer-Policy`. Plano: os quatro no bloco do frontend do `Caddyfile` (repositório do backend) e `poweredByHeader: false` no `next.config.ts`; ensaiar com a pilha local antes de publicar. Depende dos dois repositórios.
- **Testes de integração contínua do frontend** (lint, tipos, testes e build) ainda não rodam em um workflow (previsto na Etapa 10).

## Empresas

- **Usuários do SUPER_ADMIN.** A API exige `companyId` quando o SUPER_ADMIN cria um usuário e lista os usuários de todas as empresas. A tela de Usuários não pede nem filtra por empresa: para o SUPER_ADMIN, o cadastro responde 400 ("companyId é obrigatório") e a lista mistura empresas. O fluxo "Cadastrar administrador" de Empresas já envia a empresa; falta um seletor de empresa na tela de Usuários.
- **Logo de outras empresas.** A API só troca a logo da própria empresa (`/companies/me/logo`); o SUPER_ADMIN não consegue enviar a de uma empresa nova pela tela de Empresas (pendente de rota no backend).
- **Documento validado nos dois lados.** O cálculo dos dígitos de CPF e CNPJ (`utils/document.ts`) repete o do backend (`document.validator.ts`); se a regra mudar, mudar nos dois.
- **Conflito sem campo.** A API responde 409 com "documento ou subdomínio" sem dizer qual; a mensagem aparece no formulário, não num campo só.

## Acessibilidade

Auditoria da Etapa 9 (2026-10-22): `axe-core` em todas as rotas e em 11 diálogos e menus, sem achados de contraste, nomes ou marcos. Restos aceitos:

- **Contraste do foco.** O contorno blue-400 de 1 px tem ~2,6:1 contra o branco, abaixo dos 3:1 recomendados (WCAG 1.4.11). Mantido por decisão do projeto (a cor do foco é identidade visual); o `axe` não o mede.
- **Horários passados cobertos na agenda.** Na agenda de hoje, dois botões de horário que já passou ficam parcialmente cobertos por blocos de agendamento (`target-size`, WCAG 2.5.8). São alvos sob o bloco, não clicáveis na prática; esconder da leitura os horários cobertos resolveria.
- **Menus em portal (`region`).** O axe reclama de conteúdo fora de marcos nos menus do Radix, que abrem num portal. Falso positivo conhecido; não tratado.
- **Nome do bloco cancelado.** Um bloco cancelado da agenda ainda é apontado por `label-content-name-mismatch`, embora o nome acessível comece pelo texto visível; causa não encontrada.
- **Formulário não salvo.** Sair de um formulário com alterações não pergunta nada (previsto pela web-design-guidelines).
- **Áreas de segurança do iPhone.** Não há `viewport-fit=cover` nem `env(safe-area-inset-*)`; só importa se o Orari virar app instalado.
- **Sem testes automáticos de acessibilidade.** A auditoria é manual (`axe-core` em script de teste); falta rodar no CI quando houver testes (Etapa 10).
