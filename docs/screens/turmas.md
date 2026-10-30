# Turmas

Turma fixa: um horário da semana em que vários clientes são atendidos juntos, com
o mesmo serviço e o mesmo profissional (regras em `../../backend/docs/turmas.md`).
Só o ADMIN acessa: o item "Turmas" fica no menu logo depois de Serviços; para os
demais perfis a tela responde 404 (e a API, 403).

## Listagem (`/turmas`)

### Colunas

- Nome ("--" quando a turma não tem nome)
- Serviço (com o círculo da cor do serviço)
- Profissional
- Dias e horários (dia da semana e início, em ordem: "Seg 08:00 · Qui 09:00")
- Vagas (por sessão)
- Status (isActive)
- Ações
  - Alterar (em destaque).
  - Visualizar, Adicionar alunos (só turma ativa) e Inativar/Ativar (no menu de três pontos).

### Regras específicas

- Busca por nome, filtro de status (Todos, Ativas, Inativas) e paginação, pela URL.
- Não há exclusão: a turma é inativada.
- Inativar pede confirmação; a turma deixa de receber novos alunos e as sessões já
  marcadas continuam. Ativar confere de novo serviço, profissional e horários na API.
- No celular, cartões no lugar da tabela (`ListCard`).
- Onde a turma não tem nome, os textos (toasts, diálogos) usam o nome do serviço.

---

## Cadastro (`/turmas/nova`)

Página, e não dialog: a lista de horários cresce (até 21).

### Campos

- Nome (opcional, até 100 caracteres)
- Serviço (obrigatório; só os ativos que aceitam turma)
- Profissional (obrigatório)
- Vagas por sessão (obrigatório, de 2 a 100)
- Dias e horários (ao menos um): os sete dias, como no funcionamento em
  Configurações; cada dia tem "Adicionar horário" e zero ou mais horários de início.
  O fim aparece calculado ("até 08:50"): início mais a duração do serviço.

### Regras específicas

- A tela confere os obrigatórios, horário sem início e dois horários do mesmo dia
  que se sobrepõem.
- A API confere o resto e a mensagem dela aparece no toast: horário fora do
  funcionamento e sobreposição com outra turma ativa do profissional.
- Sem serviço que aceite turma, a tela avisa e aponta para Serviços.
- O rodapé lembra que serviço, profissional e horários não mudam depois do cadastro.

---

## Alteração

- Dialog só com Nome e Vagas por sessão: serviço, profissional e horários não mudam
  (para mudá-los, inativa-se a turma e cadastra-se outra). Nome vazio remove o nome.

---

## Visualização

- Dialog com serviço, duração, profissional, vagas por sessão, os horários com
  início e fim ("Terça-feira, 17:00–17:50") e o status.
- **Próximas sessões** (4 semanas): data, "X de Y vagas" (ou "Cancelada") e os
  alunos de cada uma ("Sem alunos" no horário ainda sem sessão), com rolagem
  própria.

---

## Adicionar alunos

- Dialog com a Sessão (as datas das próximas 4 semanas, com as vagas: "segunda,
  02/11 às 09:00 · 2 de 4 vagas") e a lista de alunos, como na agenda. Datas
  lotadas ou canceladas aparecem, mas não se escolhem.
- Antes de encaixar, a lista é conferida com as vagas livres da data: sem vaga para
  todos, ninguém entra e o aviso pede para tirar alunos.
- Cada aluno ganha um agendamento avulso. A sessão do dia é criada no primeiro
  encaixe. Os encaixes são feitos um a um; quem a API recusar fica na lista com o
  motivo. O mesmo encaixe pode ser feito pela agenda, no bloco da turma.

---

## Pendências

- Encaixe em lote, tudo ou nada (depende do backend).
- Alunos fixos (recorrência e plano) na Visualização (depende do backend).
