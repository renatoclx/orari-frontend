# Decisões

Decisões do projeto que afetam o código, com a data e o porquê. Decisões de
interface (cores, tamanhos) estão na skill `.claude/skills/orari-ui/SKILL.md`;
regras de cada tela, em `docs/screens/`.

## Arquitetura e dados

- **2026-10-13 — Sessão em cookies `httpOnly`; só o servidor do Next fala com a API.** O navegador não lê o token (segurança) e não conhece o endereço do backend. A renovação fica no proxy, com requisições simultâneas compartilhando uma única renovação. Detalhes em `frontend-auth.md`.
- **2026-10-13 — Camadas: tela ou Server Action, `<assunto>.service.ts`, `apiFetch`, API.** Nenhuma tela chama o `apiFetch` direto; erros viram `ApiError`.
- **2026-10-13 — Tipos do domínio escritos à mão, espelhando o backend,** criados quando a tela precisa (o Swagger só descreve as entradas).
- **2026-10-14 — As três telas de pessoas são uma implementação** (`people-kinds`), parametrizada por tipo; Usuários é outra entidade (`UserType`) e não usa essas telas. _Por quê:_ clientes, funcionários e profissionais têm os mesmos campos e regras.
- **2026-10-14 — Exclusão de pessoa é inativação** (continua na lista como Inativo, com "Reativar"). _Por quê:_ o histórico (agendamentos, pagamentos) precisa continuar apontando para a pessoa.
- **2026-10-14 — Foto da pessoa enviada depois do cadastro,** por rota própria; se falhar, só avisa. O Next reescreve `/uploads` para a API e as Server Actions aceitam corpo de 3 MB.
- **2026-10-14 — Serviço só é excluído sem vínculos;** o backend responde 409 e a tela orienta a inativar.
- **2026-10-14 — Documentação por tela:** `docs/screens/` com um arquivo por tela. _Por quê:_ o `screens.md` único passou de 500 linhas e gerava conflitos de edição.

## Agenda

- **2026-10-15 — Expediente = janelas de atendimento cadastradas.** Fora do expediente é tudo que não cabe inteiro em uma janela: antes da abertura, depois do fechamento, dias sem janela e o intervalo entre janelas (o almoço não tem regra própria; a tela só o mostra em cinza).
- **2026-10-15 — Encaixe** é agendar fora do expediente: inteiro fora das janelas, sem atravessar a meia-noite, sem passado, sem recorrência; grava com `overBooking: true` e aparece em cinza exclusivo.
- **2026-10-15 — Horários do novo agendamento:** grade de 15 em 15 minutos mais o horário logo após o fim de cada agendamento (cobre o "horário quebrado"); o atendimento cabe inteiro em uma janela. Agrupados por período (manhã, tarde, noite) em uma caixa de seleção que só mostra os períodos com horário.
- **2026-10-15 — A disponibilidade é calculada no frontend** (janelas e agendamentos buscados por uma Server Action; a conta no navegador). _Por quê:_ evitar uma rota nova no backend e responder na hora ao trocar o serviço. O servidor decide ao salvar (conflito do cliente é recusado com 409).
- **2026-10-15 — Profissionais:** por padrão todos os ativos; filtro por profissional na URL (`?professional=`) e "Mostrar Todos" sempre visível; no celular, um profissional por vez. Inativos ficam fora (a agenda deles será remanejada, fora do MVP).
- **2026-10-16 — Status:** a única ação manual é cancelar, e só antes de iniciar (também imposta no backend). Início e conclusão são automáticos (job do backend); "Confirmado" será do cliente (futuro). "Alterar" também só antes de iniciar e mantém o tipo (comum ou encaixe). _Nada no passado é alterado._
- **2026-10-16 — Cancelados na grade** aparecem esmaecidos; se outro agendamento ocupa o horário, ou há vários cancelados iguais, aparece só um. _Por quê:_ evitar blocos sobrepostos.
- **2026-10-16 — Relógio vivo:** o "agora" da agenda anda sozinho e os dados são buscados de novo a cada minuto e ao voltar para a aba. _Por quê:_ sem isso, o botão de cancelar continuava aparecendo depois do início.

## Processo

- **2026-10-14 — Comentários:** todo código novo leva comentário curto explicando o porquê (regra herdada do backend).
- **2026-10-14 — Commits só com autorização** do responsável pelo projeto; as alterações ficam no working tree para revisão.
- **2026-10-13 — Documentação do projeto atualizada ao fechar cada módulo,** em uma revisão completa; a skill `orari-ui` é atualizada quando uma decisão de interface é aprovada.

## Em aberto

- Almoço como duas janelas cadastradas pela API; tela de horário de funcionamento e pausas lançadas pelo administrador são futuras.
- Empresa sem nenhuma janela cadastrada: a API não restringe horários; falta definir o comportamento da agenda.
- Alterar agendamento de recorrência (a API tem regra própria).
