# Cobranças

Pagamentos das assinaturas, **só para o SUPER_ADMIN**. A cobrança é manual (Pix e baixa pelo SUPER_ADMIN; gateway depois). As regras estão no backend (`docs/business-rules/empresa-e-acesso.md`, "Cobranças").

## Acesso

- Rota `/cobrancas`, item **Cobranças** no menu do SUPER_ADMIN (ícone `HandCoins`), abaixo de Assinaturas. Quem não é SUPER_ADMIN recebe "não encontrada".

## Tela do mês

- Os pagamentos de um mês (`?mes=aaaa-mm`; sem ele, o mês atual em Brasília; inválido vale o atual), **pela data do pagamento**, do mais recente ao mais antigo.
- Navegação: setas de mês anterior e seguinte e **Mês atual** (`CalendarCheck`, só fora do mês atual).
- Cartões: **Recebido no mês** (com o número de pagamentos), **Média por pagamento** e **Empresas que pagaram** (de quantas têm assinatura).
- Lista (tabela no computador, cartões no celular): Pago em, Empresa (atalho para a assinatura; a observação embaixo), Período, Forma, Valor e **Excluir** (`Trash2`) só no último pagamento de cada empresa.
- **Registrar pagamento** (`HandCoins`): escolhe a empresa (só as com assinatura) e abre o formulário.

## Pagamentos da empresa (dialog)

- Aberto pelo botão `HandCoins` na linha de Assinaturas (só com assinatura) ou depois de escolher a empresa em Cobranças (direto no formulário).
- **Histórico**: do mais recente ao mais antigo, com valor, forma, data, período e observação; **Excluir** só no mais recente (com confirmação: o pago até volta ao de antes dele). Busca ao abrir; "Tentar de novo" se falhar.
- **Registrar pagamento**: Valor, Forma de pagamento (Pix, Cartão, Boleto, Transferência, Dinheiro, Outra), Pago em, Este pagamento cobre de / Até (obrigatórios) e Observação. Vem preenchido com a sugestão da API: o próximo período do ciclo (do dia seguinte ao pago até; durante o teste, do dia seguinte ao fim dele; bloqueada há tempo, de hoje) e o valor com o desconto que valer nele; pago hoje, no Pix.
- Registrar avança o **pago até** da assinatura para o fim do período (nunca recua) e atualiza Cobranças, Assinaturas e o Painel.

## No Painel

- **Dinheiro recebido**: colunas dos últimos 12 meses com a soma dos pagamentos, pela data do pagamento (valor do mês e dos 12 meses no canto).
