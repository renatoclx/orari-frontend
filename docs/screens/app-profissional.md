# App do profissional

Mesmo PWA do cliente (`/app`); muda o que aparece conforme quem entrou. Só consulta.

## Entrar

- Pelo formulário de `/app/entrar`, com **telefone** e senha (veja [app-cliente.md](app-cliente.md)). O usuário é do tipo Profissional ([usuarios.md](usuarios.md)).
- Sessão em cookies próprios (`orari_app_pro`, `orari_app_pro_refresh`), nunca os da clínica; o proxy renova o acesso vencido. Uma sessão por vez: entrar como profissional encerra a de cliente, e o contrário também.
- O sistema web recusa esse usuário, e quem tenta abrir o painel é levado ao app.

## Navegação

- Barra de baixo com **Início** e **Menu**. Rotas de cliente (Buscar, Agendamentos, página de estabelecimento, dados, avisos, pacotes) voltam ao Início.

## Início (`/app`)

- Saudação com o nome, a data, a clínica e o vínculo ("Profissional: <nome>"), com o texto de que ali ficarão agenda, clientes e comissões (as telas virão nas próximas etapas).

## Menu (`/app/menu`)

- Nome, telefone formatado e clínica; **Alterar senha** (senha atual, nova e confirmação; continua entrado, com aviso) e **Sair**.

## Pendências

- Agenda, Meus clientes (só os dele; telefone e preço do serviço, sem status de pagamento e sem anamnese), Comissões (só leitura) e fechamento do módulo.
