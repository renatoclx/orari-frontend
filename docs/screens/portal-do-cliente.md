# Portal do cliente

Tela em que a clínica liga o portal do cliente e define as regras do app (rota `/portal-do-cliente`). O app que o cliente usa ainda está em construção (etapa 7b).

## Acesso

- Grupo **Portal do cliente** no menu lateral (com ícone de celular), logo antes de **Mensagens**, com os subitens **Portal** (esta tela, em `/portal-do-cliente`) e **Avisos no celular** (`/avisos-no-celular`, ver [notificacoes.md](notificacoes.md)).
- Só para o **ADMIN** e só com a funcionalidade **Portal do cliente** no plano (matriz de acessos, `empresas.md`). Os demais veem a página "não encontrada", e a API recusa (403).
- Sem a ação **Edita**, a tela fica só leitura e sem o rodapé de salvar.

## Estrutura

Um card com quatro blocos e o rodapé padrão (**Descartar alterações** e **Salvar alterações**, habilitados quando algo mudou).

### Situação

- **Portal ligado** (interruptor; desligado por padrão). Desligado, o app e os links de acesso deixam de funcionar para o estabelecimento.

### Regras de agendamento

- Valem só para o que o cliente marca e cancela pelo app; na agenda, a clínica continua sem essas regras.
- **Antecedência mínima** (sem antecedência, 30 min, 1 h, 2 h, 3 h, 6 h, 12 h, 1 dia, 2 dias), **Agendar até (dias à frente)** (1 a 365) e **O cliente cancela** (até o início, 2, 6, 12 horas, 1, 2 ou 3 dias antes). Um valor gravado fora das listas também aparece.

### Busca no app

- **Aparecer na busca do app** (interruptor; desligado por padrão) e **Segmento** (Barbearia, Salão de beleza, Estética, Esmalteria, Design de sobrancelhas, Fisioterapia, Pilates, Psicologia, Nutrição, Odontologia, Outros).
- Aparecer na busca exige o segmento: sem ele, o campo acusa "Escolha o segmento para aparecer na busca." e nada é gravado.
- O texto do bloco avisa que quem se cadastra pela busca fica **não confirmado**, com até 2 agendamentos futuros, até a clínica confirmar no histórico do cliente (ver `pessoas.md`, "Confirmar cliente").

### Divulgação

- **Endereço no app** (`<site>/app/local/<subdomínio>`), só leitura, com o botão **Copiar**, para a clínica divulgar (Instagram, site, WhatsApp).
- Para quem já é cliente, o texto aponta o botão **Acesso ao portal** (ícone de QR code) na coluna Ações da lista de Clientes (`pessoas.md`).

## Salvar

- Server Action `savePortalSettingsAction`, que confere de novo os dias à frente e o segmento e grava tudo de uma vez (`PUT /portal-settings`).
- Erro de campo: aviso "Corrija os campos destacados." e a mensagem no campo. Sucesso: "Portal do cliente salvo.", e o formulário recomeça com o que foi gravado.

## Onde mais o portal aparece

- **Serviços → Profissionais que atendem** (`servicos.md`): o serviço só aparece no app com ao menos um profissional.
- **Clientes → Acesso ao portal** (ícone de QR code na coluna Ações e botão no histórico) e **Confirmar cliente** no histórico (`pessoas.md`).
- **Agenda → detalhe do agendamento:** "Agendado pelo cliente, no portal" (`agendamentos.md`).
