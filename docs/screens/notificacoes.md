# Notificações

O sino do cabeçalho e a página `/notificacoes`: a caixa de notificações do usuário do painel (ADMIN). O profissional tem a dele no app (ver [app-profissional.md](app-profissional.md): a caixa em Avisos e as configurações do push em Menu → Avisos no celular). Regras e rotas: `docs/business-rules/mensagens.md` do backend, "Notificações".

## O sino (cabeçalho)

- Ícone de sino à direita, antes da logo da empresa e do usuário. Uma **marca vermelha** (token `destructive`, texto `background`) mostra o **número de não lidas**: nada em zero, "99+" a partir de 100. O nome acessível diz "Notificações: 3 não lidas" (o número não fica só na cor).
- O número é conferido ao montar, **a cada 30 segundos** e ao **voltar para a aba** (aba escondida não consulta). Ler ou marcar na página atualiza o sino na hora (evento da janela).
- Ao clicar, abre um painel (`Popover`, até 24 rem, ao lado do sino) com as **últimas 10**: ícone, título (negrito se não lida), texto, "há 5 min" e uma bolinha azul nas não lidas. Tocar numa **marca como lida** e leva ao destino; **Marcar todas como lidas** no topo; **Ver todas** no rodapé abre a página. Vazio: "Nenhuma notificação por enquanto." Falha: "Não foi possível carregar. Tente de novo em instantes."
- O número cai na hora ao ler; a API confirma na conferência seguinte.
- **Aviso na tela (toaster):** chegou notificação nova com o painel aberto, ela aparece no toaster (até 3, com o título, o texto e o botão **Abrir**; passando de 3, um aviso só: "Mais N notificações novas", com **Ver todas**), além de contar no sino e na lista. A conferência devolve a data da notificação **mais nova**; a primeira resposta só fixa o ponto de partida (o que já existia não vira toast) e quem compara é a data, não o número (ler uma e chegar outra no mesmo intervalo também avisa). Pode levar até 30 s para aparecer.
- **Limpar notificações** (rodapé do sino e na página): o primeiro toque pede a confirmação ali mesmo ("Limpar todas as notificações? Elas somem da lista e do contador." com **Limpar** e **Manter**); o segundo limpa. Tira tudo da lista e do contador; as de outros usuários não mudam.

## Página `/notificacoes`

- Título, **Marcar todas como lidas** (desabilitado sem não lidas), **Limpar notificações** (mesma confirmação do sino) e o filtro **Todas** / **Não lidas (N)**, na URL (`?filtro=nao-lidas`).
- Lista de 10 por página (`?pagina=`, inválido vale 1) com o mesmo item do sino; Anterior e Próxima.
- Vazio: "Nenhuma notificação ainda" (explica que aparece, por exemplo, quando um cliente marca um horário pelo app) ou "Nenhuma notificação não lida: você está em dia".
- Sem funcionalidade de plano: qualquer usuário do painel tem. Cada um vê só as suas.

## Fontes

- Hoje: o cliente marca ou cancela um horário pelo app (avisa os administradores e o profissional do horário). O destino do aviso do administrador é a agenda.
- Previstas: resumo de pendências do dia, boas-vindas e avisos dos jobs (mesma caixa, categorias novas).

## Limites

- O push (aviso no celular) só existe no app do profissional; o painel não recebe push no navegador (ver `frontend-technical-debt.md`).
