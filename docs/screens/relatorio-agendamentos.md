# Relatório de agendamentos

## Objetivo

Mostrar ao dono quanto foi agendado, concluído, faltado e cancelado no período,
quem e qual serviço puxam esses números e quais horários são mais procurados.

## Acesso

- Rota: `/relatorios/agendamentos`.
- Menu: grupo **Relatórios** (um nível só), item "Agendamentos". Só o
  **ADMIN**; a API também recusa os demais.
- Funcionalidade em Acessos e limites, só com a ação Visualiza:
  `appointments-report` ("Agendamentos"). Marcada no modelo padrão e nos
  modelos de plano; exige ver Agendamentos.

## Regras

- Pelo **início** do agendamento, no fuso da empresa.
- **Total** não conta os cancelados. Na turma, cada aluno é um agendamento; o
  cancelamento de aula pela clínica conta como cancelado.
- **Taxa de falta** = faltas ÷ (concluídos + faltas): só o que já deveria ter
  acontecido. **Taxa de cancelamento** = cancelados ÷ todos.
- **Ocupação** fica de fora: o horário de funcionamento é da empresa, não de
  cada profissional. No lugar, os horários de pico.

## Layout

- Cabeçalho com título, descrição e **Imprimir** (só no computador).
- Filtros (na URL): **Profissional** ("Todos os profissionais" por padrão; só
  os ativos) e **Período** (padrão: mês atual). No celular fica só o
  profissional.
- Quatro cartões (`SummaryCard`): **Agendamentos** (a acontecer e quantos
  pelo app), **Concluídos** (% dos que já passaram), **Faltas** (taxa de falta;
  vermelho quando há) e **Cancelados** (% de todos).
- Gráficos, lado a lado no computador:
  - **Agendamentos no período**: por dia (até 62 dias) ou semana, barras
    empilhadas de Concluídos (verde), A acontecer (índigo) e Faltas
    (vermelho); os cancelados ficam na dica.
  - **Horários de pico**: tabela dias da semana (segunda a domingo) × hora de
    início, com a quantidade escrita na célula e o índigo mais forte onde há
    mais agendamentos.
- Tabelas **Por profissional** e **Por serviço** (este com as horas
  somadas): agendamentos, concluídos, faltas, taxa de falta e cancelados, do
  maior total para o menor.
- **Imprimir**: mesma versão de impressão dos demais relatórios (aba nova, tema
  claro, largura A4, tabelas a partir da segunda folha).

## Fora desta etapa

- Ocupação por profissional (depende da agenda de cada profissional).
- Filtro por serviço.
- Exportar em planilha.
