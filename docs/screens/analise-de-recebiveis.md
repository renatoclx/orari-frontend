# Análise de recebíveis

> Até 2026-11-10 se chamava "Contas a receber"; o nome passou para a tela
> operacional do Financeiro (antes "Pagamentos").

## Objetivo

Mostrar à clínica o que há para receber, o que está atrasado e há quanto tempo,
e quem deve. Complementa a tela **Contas a receber** do Financeiro (que lista e dá baixa) com a visão
de conjunto.

## Acesso

- Rota: `/relatorios/analise-de-recebiveis`.
- Menu: grupo **Relatórios**, item "Análise de recebíveis". Só o **ADMIN**; a API
  também recusa os demais.
- Funcionalidade em Acessos e limites, só com a ação Visualiza: `receivables`
  ("Análise de recebíveis"). Nasce desmarcada; exige ver Contas a receber e Clientes. Mais
  tarde fará parte de todos os planos.

## Regras

- Tudo sai dos **pagamentos**: atendimento avulso, recorrência e contratação de
  plano. Cancelados e excluídos ficam de fora.
- **Atrasado**: pendente com vencimento antes de hoje (a mesma regra de
  Contas a receber), no calendário da empresa.
- **Período** (de/até; padrão: o mês atual) vale só para o recebido (pela data
  do pagamento) e a inadimplência. O resto é a situação de hoje.
- **Inadimplência**: do que venceu no período até ontem, a parte que segue
  pendente (valor pendente ÷ valor vencido). Sem nada vencido: "--".
- **Mês a mês**: 6 meses até o atual e os 3 seguintes, pelo vencimento.
  Pagamento sem vencimento não entra no gráfico (entra no "A receber").

## Layout

- Cabeçalho: título "Análise de recebíveis" e descrição curta.
- Filtros (na URL): **Período** (trocar uma data leva a outra junto) e a busca
  por nome da lista. No celular fica só a busca.
- Quatro cartões (padrão dos de Contas a receber, `SummaryCard`):
  - **A receber** (neutro): todo pendente; leva a Contas a receber.
  - **Atrasado** (vermelho): valor e quantos clientes; leva a Contas a receber
    filtrado em atrasados.
  - **Recebido no período** (verde).
  - **Inadimplência** (vermelho quando há): porcentagem e "R$ x de R$ y".
- Gráficos, lado a lado no computador e empilhados no celular, com cores pelos
  tokens de gráfico (`chart-positive`, `chart-info`, `chart-negative` e a escala
  `chart-aging-1` a `4`):
  - **Atrasados por tempo de atraso**: uma barra por faixa (1 a 30, 31 a 60,
    61 a 90 e mais de 90 dias), com valor e quantidade escritos; a cor escurece
    com a idade, do laranja ao vinho.
  - **Mês a mês**: barras empilhadas de Recebido (verde), A vencer
    (índigo) e Atrasado (vermelho), com o índigo no meio para o verde não
    encostar no vermelho; a dica mostra os valores.
- Lista dos clientes com atraso, do maior valor para o menor: cliente, valor em
  atraso, quantidade de pagamentos e vencimento mais antigo ("há N dias"). Ações:
  **Ver pagamentos atrasados** (Contas a receber filtrado pelo cliente) e, para quem
  tem celular, **WhatsApp** (`wa.me`, sem envio pelo Orari).
- A página rola como um painel; a lista tem altura mínima e rola por dentro.
- **Imprimir** (cabeçalho, só no computador): abre numa aba nova a versão de
  impressão (`.../imprimir`, mesmos filtros), fora da moldura do sistema, em
  tema claro e na largura de uma folha A4: cabeçalho com empresa, filtros e
  data de geração, cartões, gráficos (sem animação) e a **lista inteira** numa
  tabela simples, a partir da segunda folha. A impressão do navegador abre
  sozinha; na tela ficam Imprimir e Fechar.

## Fora desta etapa

- Exportar a lista (planilha).
- Enviar cobrança pelo Orari.
- Visão por profissional ou por serviço.
