# Dívida técnica (Frontend)

Pontos conhecidos e aceitos por enquanto. Revisar quando o contexto mudar.

## Autenticação

- **Renovação compartilhada por instância.** No proxy, requisições simultâneas compartilham uma renovação guardada em memória. Com várias instâncias do frontend, cada uma teria a sua, e a rotação poderia recusar uma delas (o usuário seria deslogado). Hoje há uma instância só.
- **Mensagem do 401 em inglês.** O backend responde "Unauthorized"; não aparece na tela (o 401 leva ao login), mas não é traduzida.

## Telas

- **Empresa sem nenhuma janela cadastrada.** A API não restringe horários nem há encaixe; a agenda trata o dia sem janela como "somente encaixe" (o agendamento comum fica sem horários).
- **Conflito do cliente.** Os horários oferecidos só consideram os agendamentos do profissional; se o cliente já tiver agendamento no horário, o servidor recusa (409) e a tela informa.
- **Disponibilidade calculada no frontend.** As regras de horário (janela, conflito, passado) são repetidas na tela; a API é quem decide ao salvar. Se divergirem, o servidor vence. Uma rota de disponibilidade no backend centralizaria as regras.
- **Busca de clientes e serviços.** Clientes: busca no servidor (20 por vez). Serviços: até 100 ativos, filtrados na tela.
- **Profissionais da agenda.** A grade carrega até 100 profissionais (uma página). Acima disso, os demais não aparecem.
- **Pausas por profissional.** O backend só tem o horário de funcionamento da empresa; a agenda não desenha pausas (previsto: o administrador poderá lançá-las).
- **Posição inicial da grade.** No celular a grade abre no início da faixa (2 h antes do expediente); falta rolar até o primeiro agendamento ou até o horário atual.
- **Nomes de profissional fora da lista.** Agendamentos de profissionais inativos não aparecem (a agenda deles será remanejada, fora do MVP).

## Recorrências

- **Horários do cadastro pela primeira ocorrência.** Cada dia da semana mostra os horários livres só da primeira data; as demais são conferidas ao salvar (tudo ou nada, com a data do conflito). Uma simulação no backend (dry-run) mostraria todos os conflitos antes.
- **Recorrências de pacote na lista.** A API não filtra por pacote; elas aparecem, sem a ação de cancelar.
- **Ordem da lista.** A API ordena pela data inicial crescente: as mais novas ficam nas últimas páginas.
- **Busca de clientes duplicada.** `useClientSearch` (recorrência) e o dialog de novo agendamento têm a mesma lógica; unificar quando o dialog for revisto.
- **Remanejar pela agenda busca a recorrência ao abrir** (a resposta do agendamento não traz o período). O dialog aparece depois dessa busca.

## Configurações da empresa

- **Gravação em etapas.** Nome fantasia, logo e cada janela de horário usam chamadas separadas. Se uma falhar no meio, o que veio antes já foi gravado; a mensagem diz qual parte falhou e a tela recarrega o que ficou salvo. Uma rota que gravasse a semana inteira de uma vez (como o `batch`, mas substituindo) evitaria isso.
- **Dias da semana.** A lista `WEEK_DAYS` (usada também na recorrência) está em `components/recurrences/`; mover para `utils/` quando um terceiro módulo precisar.
- **Dados cadastrais só leitura.** Razão social, CNPJ, fuso e demais dados só o SUPER_ADMIN altera (sem tela no frontend).

## Pessoas

- **Foto fora da transação.** No cadastro, a pessoa é criada e a foto enviada depois, por rota própria. Se a foto falhar, a pessoa já existe (o usuário é avisado e pode enviar na alteração). Idem para o contato principal e a foto na alteração: falhas após o `PATCH` da pessoa viram avisos.
- **Contatos e endereços na alteração valem na hora.** Adicionar e excluir não esperam o "Salvar alterações" (a API os mantém em rotas próprias). Cancelar a tela não desfaz o que já foi adicionado ou excluído.
- **Cidade dos endereços.** `GET /addresses` devolve só `cityId`; a tela de alteração busca cada cidade (`GET /cities/:id`) para exibir nome e UF. Se o backend passar a devolver cidade e estado, eliminar essas buscas.
- **Filtro de status na listagem.** A lista mostra ativos e inativos juntos; falta o filtro por status (previsto).
- **Reescrita de `/uploads`.** Depende de `API_URL` definida na hora do build/início do servidor; sem ela, as fotos não aparecem.
- **Teste com backend real.** O fluxo (cadastro, foto, alteração, busca de cidade) foi verificado contra uma API simulada; falta a verificação com login e backend reais.

## Acessibilidade

- **Contraste do foco.** O contorno blue-400 de 1 px tem ~2,6:1 contra o branco, abaixo dos 3:1 recomendados (WCAG).
