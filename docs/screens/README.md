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

| Arquivo                                      | Conteúdo                                                |
| -------------------------------------------- | ------------------------------------------------------- |
| [login.md](login.md)                         | Login e recuperação de senha                            |
| [layout.md](layout.md)                       | Sidebar e barra de ações lateral                        |
| [pessoas.md](pessoas.md)                     | Clientes, funcionários e profissionais                  |
| [servicos.md](servicos.md)                   | Serviços                                                |
| [agendamentos.md](agendamentos.md)           | Agenda, novo agendamento, encaixe, detalhes e alteração |
| [recorrencias.md](recorrencias.md)           | Recorrências                                            |
| [configuracoes.md](configuracoes.md)         | Configurações da empresa                                |
| [pacotes.md](pacotes.md)                     | Planos e contratações                                   |
| [usuarios.md](usuarios.md)                   | Usuários (acesso ao sistema)                            |
| [metodos-pagamento.md](metodos-pagamento.md) | Métodos de pagamento                                    |
| [financeiro.md](financeiro.md)               | Pagamentos e Comandas                                   |
| [empresas.md](empresas.md)                   | Empresas (só SUPER_ADMIN)                               |

## Convenções

- Quando houver informação que não existe, as tabelas mostram "--".
- Textos da interface em pt-BR.
- Itens marcados como "implementação futura" ou "Pendências" ainda não foram
  especificados nem implementados.
