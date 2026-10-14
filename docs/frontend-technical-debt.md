# Dívida técnica (Frontend)

Pontos conhecidos e aceitos por enquanto. Revisar quando o contexto mudar.

## Autenticação

- **Renovação compartilhada por instância.** No proxy, requisições simultâneas compartilham uma renovação guardada em memória. Com várias instâncias do frontend, cada uma teria a sua, e a rotação poderia recusar uma delas (o usuário seria deslogado). Hoje há uma instância só.
- **Mensagem do 401 em inglês.** O backend responde "Unauthorized"; não aparece na tela (o 401 leva ao login), mas não é traduzida.

## Telas

- **Agenda somente leitura.** O botão "Novo Agendamento" e os blocos ainda não têm ação (cadastro, remarcação, cancelamento e mudança de status serão especificados em etapas futuras).
- **Profissionais da agenda.** A grade carrega até 100 profissionais (uma página). Acima disso, os demais não aparecem.
- **Pausas por profissional.** O backend só tem o horário de funcionamento da empresa; a agenda não desenha pausas (previsto: o administrador poderá lançá-las).
- **Posição inicial da grade.** No celular a grade abre no início da faixa (2 h antes do expediente); falta rolar até o primeiro agendamento ou até o horário atual.
- **Calendário do atalho** usa o relógio do navegador para marcar "hoje"; se o fuso do navegador diferir do da empresa, o marcador pode divergir da agenda (que usa o fuso da empresa).
- **Nomes de profissional fora da lista.** Agendamentos de profissionais inativos não aparecem (a agenda deles será remanejada, fora do MVP).

## Pessoas

- **Foto fora da transação.** No cadastro, a pessoa é criada e a foto enviada depois, por rota própria. Se a foto falhar, a pessoa já existe (o usuário é avisado e pode enviar na alteração). Idem para o contato principal e a foto na alteração: falhas após o `PATCH` da pessoa viram avisos.
- **Contatos e endereços na alteração valem na hora.** Adicionar e excluir não esperam o "Salvar alterações" (a API os mantém em rotas próprias). Cancelar a tela não desfaz o que já foi adicionado ou excluído.
- **Cidade dos endereços.** `GET /addresses` devolve só `cityId`; a tela de alteração busca cada cidade (`GET /cities/:id`) para exibir nome e UF. Se o backend passar a devolver cidade e estado, eliminar essas buscas.
- **Filtro de status na listagem.** A lista mostra ativos e inativos juntos; falta o filtro por status (previsto).
- **Reescrita de `/uploads`.** Depende de `API_URL` definida na hora do build/início do servidor; sem ela, as fotos não aparecem.
- **Teste com backend real.** O fluxo (cadastro, foto, alteração, busca de cidade) foi verificado contra uma API simulada; falta a verificação com login e backend reais.

## Acessibilidade

- **Contraste do foco.** O contorno blue-400 de 1 px tem ~2,6:1 contra o branco, abaixo dos 3:1 recomendados (WCAG).
