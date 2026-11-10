# Perfil do cliente

## Objetivo

Mostrar ao dono, para a empresa toda, quantos clientes estão voltando, como
agendam, o que consomem, o perfil do cadastro e quem faz aniversário no
período.

## Acesso

- Rota: `/relatorios/perfil-do-cliente`.
- Menu: grupo **Relatórios** (um nível só), item "Perfil do cliente". Só o
  **ADMIN**; a API também recusa os demais.
- Funcionalidade em Acessos e limites, só com a ação Visualiza:
  `clients-report` ("Perfil do cliente"). Marcada no modelo padrão e nos
  modelos de plano; exige ver Clientes e Agendamentos.

## Regras

- Base: clientes **ativos no cadastro** (os inativados ficam de fora).
- **Ativo**: atendimento concluído nos últimos 60 dias ou algo marcado (a
  regra da Carteira de clientes). **Sem retorno**: o resto, inclusive quem
  nunca foi atendido.
- **Novo**: o primeiro atendimento concluído na empresa caiu no período.
- **Frequência**: concluídos no período ÷ clientes atendidos no período.
- **Tipo de atendimento** (avulso, recorrência, pacote, turma): sobre os
  atendidos, sem exclusividade (pacote numa turma conta nos dois).
- **Faixa etária** e **cidade** (endereço principal): sem o dado, "Não
  informado".
- **Aniversariantes**: aniversário dentro do período; 29/02 comemora em 28/02
  nos anos não bissextos.

## Layout

- Cabeçalho com título, descrição e **Imprimir** (só no computador).
- Filtro (na URL): **Período** (padrão: mês atual). No celular a barra some.
- Quatro cartões (`SummaryCard`): **Clientes ativos** (verde, com o % da base),
  **Novos no período**, **Sem retorno** (vermelho quando há) e **Frequência
  média**.
- Quatro distribuições em barras horizontais (`ShareList`: rótulo, barra
  índigo proporcional, quantidade e %; "Não informado" e "Outras" em cinza),
  duas por linha em telas largas: **Tipo de atendimento**, **Por onde
  agendam** (clínica ou app, com quantos clientes têm o app), **Faixa etária**
  e **Cidades** (as 5 mais comuns).
- **Aniversariantes do período**: cliente, aniversário, idade que completa,
  nascimento e o atalho do WhatsApp com "Feliz aniversário" (só com celular);
  paginada (10 por página). No celular, cartões.
- **Imprimir**: mesma versão de impressão dos demais relatórios; as
  distribuições em duas colunas e a lista inteira, com o celular.

## Fora desta etapa

- Sexo (não há o campo no cadastro).
- Lista de clientes para reativar (fica no cadastro de clientes).
- Exportar em planilha.
