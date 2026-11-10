# Comissões

## Objetivo

Mostrar ao dono a comissão de cada profissional pelos atendimentos concluídos
no período, quanto os clientes já pagaram, o que já foi adiantado e o que
falta pagar; fechar (quitar) e emitir o recibo para o profissional assinar.

## Acesso

- Rota: `/financeiro/comissoes`.
- Menu: grupo **Financeiro**, item "Comissões" (o último do grupo), só para o
  **ADMIN** (é remuneração); a API também recusa os demais.
- Funcionalidade em Acessos e limites: `commissions` ("Comissões"):
  Visualiza, Edita (fechar), Cria (lançar adiantamento) e Exclui (excluir
  adiantamento e desfazer fechamento); sem a ação, o botão some. Marcada no modelo padrão e nos modelos
  com financeiro (fora do Agenda); exige ver Profissionais e Pagamentos.

## Regras

- A comissão é gerada sozinha na conclusão do atendimento, pela regra do
  serviço (ver `servicos.md` e "Comissão" em `business-rules.md` do backend).
  Cancelado não gera; nada é retroativo.
- Período pela **data do atendimento**, no fuso da empresa.
- **Cliente pagou**: avulso com o pagamento pago = **Pago** (senão **A
  receber**); sessão de pacote = a parte da base na proporção do que a
  contratação já recebeu (**Parcial**, com o valor, quando não chega à base).
- **Em aberto** = ainda não fechado. Adiantado e A pagar contam tudo o que
  está em aberto, **sem depender do período**; o período vale para a comissão
  gerada, o pago pelos clientes e os atendimentos.
- **Adiantamento**: data até hoje (pode ser passada, nunca futura) e valor até
  o **disponível para adiantar** (comissão em aberto − já adiantado). Pode ser
  excluído enquanto não foi fechado.
- **Fechamento**: quita **tudo o que está em aberto até a data de corte**
  (atendimentos até o fim desse dia e adiantamentos com data até ela) e
  registra o pagamento (método ativo e data, até hoje). Gera o **recibo** com
  número sequencial por empresa. Só o **último** fechamento do profissional
  pode ser **desfeito**: o recibo fica marcado como cancelado (o número não
  volta) e tudo volta ao em aberto.

## Layout

- Cabeçalho com título, descrição, **Fechar comissão** (`CheckCircle2`,
  outline; só com um profissional no filtro) e **Lançar adiantamento**
  (`Plus`, ação principal). No celular, empilhados.
- Filtros (na URL): **Profissional** ("Todos os profissionais" por padrão; só
  os ativos) e **Período** (padrão: mês atual; no celular fica só o
  profissional).
- Quatro cartões (`SummaryCard`): **Comissão gerada** (verde, com os
  atendimentos do período), **Já pago pelos clientes** (% da base),
  **Adiantado** e **A pagar** (em aberto).
- **Sem profissional**: lista **Por profissional** (atendimentos, comissão,
  pago pelos clientes, adiantado, a pagar), do maior valor para o menor; quem
  só tem saldo em aberto também aparece. O olho (`Eye`) filtra o profissional
  mantendo o período.
- **Com profissional**: o quadro tem abas por link (`?aba=`):
  - **Atendimentos (N)**: data, cliente, serviço — com "(pacote)" na sessão de
    pacote —, base, regra "40%" ou "R$ 15,00 fixo", comissão e cliente pagou,
    do mais recente, 10 por página;
  - **Adiantamentos (N)**: os com data no período (em aberto ou fechados) e
    os em aberto de qualquer data, com data, valor, observação, lançado por e
    **Situação** ("Em aberto" ou "Fechado nº 0001"); a lixeira só nos em
    aberto;
  - **Fechamentos (N)**: nº, até, pago em, método, comissões, adiantado e
    pago, do mais recente; imprimir recibo (`Printer`, aba nova) e, só no
    último não desfeito, desfazer (`Undo2`, `ConfirmDialog` vermelho). O
    desfeito aparece em cinza com "(desfeito)".
  Na aba Atendimentos, a coluna **Situação** diz "Em aberto" ou "Fechado nº
  0001". No celular, cartões.
- **Lançar adiantamento** (dialog, `sm:max-w-lg`): Profissional (já vem o do
  filtro) e Data (hoje; nada futuro) lado a lado, Valor (R$) com "Disponível
  para adiantar: R$ X" embaixo (atualiza ao trocar o profissional) e
  Observação; erro no próprio campo (ex.: "O valor passa do disponível para
  adiantar."). Botões Cancelar e **Lançar** ("Lançando…").
- **Fechar comissão** (dialog, `sm:max-w-lg`): "Fechar até" (hoje; nada
  futuro), resumo refeito a cada data (Comissões (N atendimentos), −
  Adiantamentos (N), **A pagar**), Método de pagamento (os ativos) e Data do
  pagamento. Sem nada em aberto, o aviso "Nada em aberto até esta data." e o
  botão desabilitado. Botões Cancelar e **Fechar e gerar recibo**
  ("Fechando…"). Ao fechar, o diálogo mostra "Comissão fechada" com
  **Imprimir recibo** (abre a aba nova pelo clique, que o navegador não
  bloqueia).
- **Recibo** (`/financeiro/comissoes/recibo/[id]`, grupo `(print)`, A4, abre
  a impressão sozinho): empresa (nome, razão social e CPF/CNPJ), "RECIBO DE
  PAGAMENTO DE COMISSÃO" com o nº, o texto "Recebi de <razão social> a
  quantia de R$ X (valor por extenso), referente às comissões dos atendimentos
  realizados até <data>, já descontados os adiantamentos, paga em <data> por
  <método>.", o resumo com os adiantamentos, o **detalhamento dos
  atendimentos** (data, cliente, serviço, base, comissão), as linhas de local
  e data e a de **assinatura** com o nome e o CPF do profissional (o CPF só
  quando cadastrado), e o rodapé com o nº, a data de emissão e quem fechou.
  Sai da cópia gravada no fechamento. Desfeito: marca "CANCELADO por <nome>"
  e não abre a impressão sozinho.
- **Excluir adiantamento**: `ConfirmDialog` vermelho com "O adiantamento de
  R$ X para <profissional>, lançado em <data>, deixa de ser abatido no
  fechamento.", botões Voltar e Excluir ("Excluindo…"); aviso ao terminar.

## Fora desta etapa

- Imprimir ou exportar a tela de Comissões (o recibo é a impressão).
- Gerar a conta no Contas a pagar a partir do fechamento.
- Percentual diferente por profissional (hoje só "recebe ou não recebe", no
  cadastro do profissional).
