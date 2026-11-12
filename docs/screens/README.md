# Telas

## Objetivo

Criar as telas correspondentes a cada entidade, baseadas nas informações descritas aqui, na skill `orari-ui` (`.claude/skills/orari-ui/SKILL.md`) e em `../screen-patterns.md`.

## Como ler

Especificação das telas do Orari, uma por arquivo. Cada arquivo descreve os
campos, as regras e o layout de uma tela ou de um grupo de telas.

As telas seguem os padrões de `../screen-patterns.md` (listagens, tabelas, ações,
diálogos, formulários), salvo quando o arquivo da tela define comportamento
diferente. Em caso de conflito, prevalece o arquivo da tela.

## Índice

| Arquivo                                                    | Conteúdo                                                  |
| ---------------------------------------------------------- | --------------------------------------------------------- |
| [login.md](login.md)                                       | Login e recuperação de senha                              |
| [layout.md](layout.md)                                     | Sidebar e barra de ações lateral                          |
| [pessoas.md](pessoas.md)                                   | Clientes, funcionários e profissionais                    |
| [servicos.md](servicos.md)                                 | Serviços                                                  |
| [agendamentos.md](agendamentos.md)                         | Agenda, novo agendamento, encaixe, detalhes e alteração   |
| [recorrencias.md](recorrencias.md)                         | Recorrências                                              |
| [configuracoes.md](configuracoes.md)                       | Configurações da empresa                                  |
| [pacotes.md](pacotes.md)                                   | Planos e contratações                                     |
| [usuarios.md](usuarios.md)                                 | Usuários (acesso ao sistema)                              |
| [metodos-pagamento.md](metodos-pagamento.md)               | Métodos de pagamento                                      |
| [financeiro.md](financeiro.md)                             | Contas a receber, Comandas e venda de produtos            |
| [empresas.md](empresas.md)                                 | Empresas (só SUPER_ADMIN)                                 |
| [anamnese.md](anamnese.md)                                 | Anamnese: modelos, fichas, PDF e auditoria                |
| [turmas.md](turmas.md)                                     | Turmas fixas (só ADMIN)                                   |
| [portal-do-cliente.md](portal-do-cliente.md)               | Portal do cliente: regras e busca do app (só ADMIN)       |
| [mensagens.md](mensagens.md)                               | Mensagens automáticas ao cliente do app (só ADMIN)        |
| [ajuda.md](ajuda.md)                                       | Ajuda: manuais em PDF (só ADMIN)                          |
| [contas-a-pagar.md](contas-a-pagar.md)                     | Contas a pagar, comissões e categorias de despesa (ADMIN) |
| [produtos.md](produtos.md)                                 | Produtos, categorias e estoque (só ADMIN)                 |
| [comissoes.md](comissoes.md)                               | Comissões: consulta, adiantamentos, fechamento e recibo   |
| [dashboard.md](dashboard.md)                               | Dashboard: os números dos relatórios (só ADMIN)           |
| [carteira-clientes.md](carteira-clientes.md)               | Relatório: carteira de clientes por profissional          |
| [analise-de-recebiveis.md](analise-de-recebiveis.md)       | Relatório: análise de recebíveis (atraso, inadimplência)  |
| [relatorio-agendamentos.md](relatorio-agendamentos.md)     | Relatório: agendamentos e horários de pico                |
| [rankings.md](rankings.md)                                 | Relatório: rankings de serviços, profissionais e clientes |
| [relatorio-financeiro.md](relatorio-financeiro.md)         | Relatório: o que entrou no caixa                          |
| [relatorio-pacotes.md](relatorio-pacotes.md)               | Relatório: contratações de pacote                         |
| [relatorio-perfil-cliente.md](relatorio-perfil-cliente.md) | Relatório: perfil do cliente e aniversariantes            |
| [app-cliente.md](app-cliente.md)                           | App do cliente (`/app`): entrar, buscar, agendar, Menu    |
| [app-profissional.md](app-profissional.md)                 | App do profissional (`/app`): entrar, Início, Menu        |

## Convenções

- Quando houver informação que não existe, as tabelas mostram "--".
- Textos da interface em pt-BR.
- Itens marcados como "implementação futura" ou "Pendências" ainda não foram
  especificados nem implementados.
