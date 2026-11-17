# Painel

Como vai o Orari, **só para o SUPER_ADMIN**: receita, empresas, crescimento e uso. Os números vêm de uma rota (`GET /platform/dashboard`), com as regras no backend (`docs/business-rules/empresa-e-acesso.md`, "Painel da plataforma").

## Acesso

- Rota `/painel`, primeiro item do menu do SUPER_ADMIN (ícone de dashboard), acima de Empresas e Assinaturas. É a tela em que ele entra: o login e qualquer tela da aplicação levam para cá.
- Quem não é SUPER_ADMIN recebe "não encontrada".
- Conta só as empresas **ativas**, menos a da plataforma. A página rola por inteiro, como o Dashboard da empresa.

## Blocos, de cima para baixo

- **Cartões do topo** (`SummaryCard`):
  - **Receita mensal (MRR)**: equivalente mensal das assinaturas ativas e em atraso (valor do ciclo ÷ meses), com o desconto que ainda vale; embaixo, o ARR (× 12) e quanto os descontos custam por mês.
  - **Empresas pagantes**, com quantas estão em teste.
  - **Conversão do teste**: dos testes já encerrados, quantos chegaram a pagar ("--" sem nenhum encerrado).
  - **Em atraso**: soma dos ciclos vencidos ainda na tolerância, com o número de empresas (vermelho quando há).
- **Precisa de atenção**, quatro listas curtas (até 5 linhas; o resto vira "+ N em Assinaturas"), cada linha um atalho para a assinatura da empresa:
  - **Testes acabando** (próximos 7 dias), **Pagamentos vencidos** (o dia em que bloqueia), **Renovações chegando** (vencem em 14 dias) e **Empresas paradas** (sem agendamento criado há 14 dias, menos as bloqueadas; quem nunca usou primeiro). Prazo por extenso: "hoje", "amanhã", "em 3 dias".
- **Receita e empresas**:
  - **Receita por plano**: uma barra por plano (a maior ocupa a largura), com o MRR, a participação e o número de empresas; embaixo, os ciclos das pagantes (Mensal, Semestral, Anual).
  - **Situação das empresas**: barra empilhada (Em teste, Ativas, Em atraso, Somente leitura, Canceladas, Sem assinatura) e a legenda com o número de cada uma.
- **Crescimento**: dois gráficos de colunas dos últimos 12 meses, com o número do mês atual e o total no canto e o mês por extenso na dica: **Novas empresas** (cadastradas por mês) e **Agendamentos na plataforma** (criados por mês, somando todas as empresas).
- **Uso por empresa**: tabela (cartões no celular) com Empresa (atalho para a assinatura), Situação, Plano, Agendamentos criados nos últimos 30 dias (com uma barra fina proporcional ao maior), Clientes e Profissionais ativos e a Última atividade ("hoje", "ontem", "há 5 dias", "nunca"). Quem mais usa primeiro.

## Cores

- Tokens de gráfico do `globals.css`: planos em `chart-cat-1` a `3` (ordem fixa); situação em `chart-info` (teste), `chart-positive` (ativas), `chart-aging-1` (atraso), `chart-negative` (somente leitura), `chart-aging-4` (canceladas) e `muted-foreground` (sem assinatura). A cor nunca vem sozinha: o nome e o número estão escritos ao lado.
