# Configurações da empresa

> Área onde o administrador da empresa altera a identidade e os horários de
> funcionamento e consulta os dados cadastrais, que não podem ser alterados.

## Acesso

- Pelo menu do usuário (avatar no header): **Configurações da empresa**.
- Rota: `/configuracoes`. A API permite alterar nome fantasia e logo a ADMIN e SUPER_ADMIN; o USER recebe 403.

## Estrutura

Um único card, com rolagem própria e rodapé fixo, com três seções e um só formulário:

### Identidade

- **Nome fantasia:** até 100 caracteres. Vazio remove o nome: o header e o menu passam a mostrar a razão social.
- **Logo:** JPEG ou PNG, até 2 MB (SVG não é aceito). Prévia retangular, com "Selecionar/Trocar logo" e "Remover". A tela valida o tipo e o tamanho antes de enviar. Aparece no header, ao lado do usuário; sem logo, nada aparece, e se a imagem não carregar ela some em vez de mostrar o ícone de imagem quebrada.

### Dados da empresa (só leitura)

- Razão social, CNPJ (formatado), data de fundação, subdomínio e fuso horário.
- Para alterar, fale com o suporte do Orari (só o SUPER_ADMIN altera esses dados).

### Horários de funcionamento

- Os sete dias, cada um com uma ou mais janelas de atendimento (abertura e fechamento, em passos de 15 minutos).
- O almoço (ou qualquer intervalo) é o espaço entre duas janelas: cadastram-se duas janelas no dia.
- Dia sem janela fica "Fechado": só aceita encaixe.
- Cada janela tem o botão de remover; "Adicionar janela" cria a próxima começando onde a última do dia termina.

### Regras dos horários

- A abertura deve ser antes do fechamento.
- Janelas do mesmo dia não se sobrepõem (encostar é permitido: 12:00–13:00 e 13:00–18:00).
- Os erros aparecem na própria janela. O servidor valida de novo.
- Alterar os horários não muda agendamentos já marcados (o rodapé avisa).

## Salvar

- Um só botão, **Salvar alterações**, habilitado quando algo mudou; **Descartar alterações** volta tudo ao que está gravado.
- Envia apenas o que mudou, na ordem: nome fantasia, logo e horários. Cada parte usa a sua rota; se uma falhar, as anteriores já valeram e a mensagem diz qual parte falhou (ex.: "Logo: A logo deve ter até 2 MB.").
- Os horários são gravados pela diferença com a API: exclui as janelas removidas, altera as que mudaram e cria as novas em lote.
- Depois de salvar, a tela e o header se atualizam sozinhos (nome e logo novos).

## Pendências

- Pausas por profissional (o administrador poderá lançá-las): futuro.
- Alterar o fuso e os dados cadastrais: só o SUPER_ADMIN, fora do MVP do frontend.
